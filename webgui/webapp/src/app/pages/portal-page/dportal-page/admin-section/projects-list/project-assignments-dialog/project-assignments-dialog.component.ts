import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { catchError, of } from 'rxjs';
import { DportalService } from 'src/app/services/dportal.service';

@Component({
  selector: 'app-project-assignments',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './project-assignments-dialog.component.html',
  styleUrl: './project-assignments-dialog.component.scss',
})
export class ProjectAssignmentsDialogComponent {
  project: string;
  emailForm: FormGroup;

  constructor(
    private dps: DportalService,
    private sb: MatSnackBar,
    public dialogRef: MatDialogRef<ProjectAssignmentsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { project: string },
  ) {
    this.project = data.project;
    this.emailForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  submit(email: string) {
    this.dps
      .adminAddUserToProject(this.project, email)
      .pipe(catchError(() => of(null)))
      .subscribe((res: any) => {
        if (!res) {
          this.sb.open('Unable to add user. Please check email.', 'Close', {
            duration: 60000,
          });
        } else {
          this.sb.open('User added successfully.', 'Close', {
            duration: 60000,
          });
          this.emailForm.reset();
          this.dialogRef.close();
        }
      });
  }
}
