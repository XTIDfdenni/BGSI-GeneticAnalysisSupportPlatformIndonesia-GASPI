import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AdminService } from 'src/app/pages/admin-page/services/admin.service';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  of,
} from 'rxjs';
import * as _ from 'lodash';
import { ComponentSpinnerComponent } from 'src/app/components/component-spinner/component-spinner.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DportalService } from 'src/app/services/dportal.service';
import { AwsService } from 'src/app/services/aws.service';

@Component({
  selector: 'app-admin-user-click-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatCheckboxModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    ComponentSpinnerComponent,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './admin-user-click-dialog.component.html',
  styleUrls: ['./admin-user-click-dialog.component.scss'],
  providers: [AdminService],
})
export class AdminUserClickDialogComponent implements OnInit {
  protected initialGroups: any = {
    administrators: false,
  };
  protected form: FormGroup;
  protected loading = false;
  protected disableDelete = false;
  protected costEstimation: number | null = 0;

  constructor(
    public dialogRef: MatDialogRef<AdminUserClickDialogComponent>,
    private fb: FormBuilder,
    private as: AdminService,
    private dp: DportalService,
    private aws: AwsService,
    private dg: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.form = this.fb.group({
      administrators: [false],
      sizeOfData: ['', [Validators.required, Validators.min(0)]],
      countOfQueries: ['', [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.costEstimation = this.data.costEstimation;
    this.form.patchValue({
      sizeOfData: this.data.sizeOfData,
      countOfQueries: this.data.countOfQueries,
    });

    this.getUserGroups();
    this.onChangeCalculateCost();
  }

  onChangeCalculateCost() {
    this.form.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((values) => {
        if (values.countOfQueries && values.sizeOfData) {
          this.aws
            .calculateQuotaEstimationPerMonth(
              values.countOfQueries,
              values.sizeOfData,
            )

            .subscribe((res) => {
              this.costEstimation = res;
            });
        }
      });
  }

  getUserGroups() {
    this.loading = true;
    this.as
      .listUsersGroups(this.data.email)
      .pipe(catchError(() => of(null)))
      .subscribe((response: any) => {
        const groups = _.get(response, 'groups', []);
        const user = _.get(response, 'user', null);
        const authorizer = _.get(response, 'authorizer', null);
        const groupNames = _.map(
          groups,
          (group) => _.split(group.GroupName, '-')[0],
        );
        const userGroups: { [key: string]: boolean } = {};
        _.each(groupNames, (gn: string) => {
          userGroups[gn] = true;
        });
        _.merge(this.initialGroups, userGroups);
        this.form.patchValue(userGroups);
        if (user === authorizer) {
          this.form.get('administrators')?.disable();
          this.disableDelete = true;
        }
        this.loading = false;
      });
  }

  async delete() {
    const { ActionConfirmationDialogComponent } = await import(
      '../../../../components/action-confirmation-dialog/action-confirmation-dialog.component'
    );

    const dialog = this.dg.open(ActionConfirmationDialogComponent, {
      data: {
        title: 'Delete User',
        message: 'Are you sure you want to delete this user?',
      },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.loading = true;
        this.as
          .deleteUser(this.data.email)
          .pipe(catchError(() => of(null)))
          .subscribe(() => {
            this.loading = false;
            this.dialogRef.close({ reload: true });
          });
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  updateQuota() {
    return this.dp
      .upsertUserQuota(this.data.sub, this.costEstimation, {
        quotaSize: this.form.value.sizeOfData,
        quotaQueryCount: this.form.value.countOfQueries,
        usageSize: this.data.usageSize,
        usageCount: this.data.usageCount,
      })
      .pipe(catchError(() => of(null)));
  }

  updateUser() {
    const groups = _.pick(this.form.value, ['administrators']);
    debugger;
    return this.as
      .updateUsersGroups(this.data.email, groups)
      .pipe(catchError(() => of(null)));
  }

  done(): void {
    this.loading = true;

    const updateQuota$ = this.updateQuota();
    const updateUser$ = this.updateUser();

    forkJoin([updateQuota$, updateUser$]).subscribe(() => {
      this.loading = false;
      this.dialogRef.close();
    });
  }
}
