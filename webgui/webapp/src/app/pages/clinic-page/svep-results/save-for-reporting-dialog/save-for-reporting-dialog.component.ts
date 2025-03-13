import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
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
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, of } from 'rxjs';
import { ClinicService } from 'src/app/services/clinic.service';
import { SpinnerService } from 'src/app/services/spinner.service';

@Component({
  selector: 'app-save-for-reporting-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './save-for-reporting-dialog.component.html',
  styleUrl: './save-for-reporting-dialog.component.scss',
})
export class SaveForReportingDialogComponent {
  protected saveForm: FormGroup = new FormGroup({
    comment: new FormControl('', [Validators.required]),
  });

  constructor(
    protected cs: ClinicService,
    private sb: MatSnackBar,
    private ss: SpinnerService,
    public dialogRef: MatDialogRef<SaveForReportingDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { projectName: string; requestId: string },
  ) {}

  saveForReporting() {
    const variants = [...this.cs.selectedVariants.getValue().values()];
    this.ss.start();
    this.cs
      .saveVariants(
        this.data.projectName,
        this.data.requestId,
        this.saveForm.get('comment')?.value,
        variants,
      )
      .pipe(catchError((err) => of(err)))
      .subscribe((data) => {
        if (!data) {
          this.sb.open('Failed to save variants', 'Okay', {
            duration: 5000,
          });
        } else {
          this.sb.open('Variants saved', 'Okay', {
            duration: 5000,
          });
          this.cs.selectedVariants.next(new Map());
          this.cs.savedVariantsChanged.next();
          this.dialogRef.close();
        }
        this.ss.end();
      });
  }
}
