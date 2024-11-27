import { Component, Inject } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { catchError, of } from 'rxjs';
import { ComponentSpinnerComponent } from 'src/app/components/component-spinner/component-spinner.component';
import { DportalService } from 'src/app/services/dportal.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { environment } from 'src/environments/environment';

function atLeastOneCheckboxChecked(
  formArray: AbstractControl,
): ValidationErrors | null {
  const isChecked = (formArray as FormArray).controls.some(
    (control) => control.get('checked')?.value,
  );
  return isChecked ? null : { atLeastOneRequired: true };
}

@Component({
  selector: 'app-beacon-ingest-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSnackBarModule,
    ComponentSpinnerComponent,
  ],
  templateUrl: './beacon-ingest-dialog.component.html',
  styleUrl: './beacon-ingest-dialog.component.scss',
})
export class BeaconIngestDialogComponent {
  ingestionForm: FormGroup;
  jsons: string[] = [];
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<BeaconIngestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    fb: FormBuilder,
    private dps: DportalService,
    private sb: MatSnackBar,
  ) {
    const vcfs = data.project.files.filter(
      (f: string) =>
        f.endsWith('.vcf.gz') && data.project.files.includes(`${f}.tbi`),
    );
    this.jsons = data.project.files.filter((f: string) => f.endsWith('.json'));
    this.ingestionForm = fb.group({
      projectName: [data.project.name],
      datasetId: [
        '',
        [
          Validators.required,
          Validators.pattern('^[^\\s/]+$'),
          Validators.maxLength(32),
          Validators.minLength(6),
        ],
      ],
      vcfLocations: fb.array(
        vcfs.map((v: string) => fb.group({ name: v, checked: false })),
        atLeastOneCheckboxChecked,
      ),
      s3Payload: ['', Validators.required],
    });
  }

  get vcfLocations(): FormArray {
    return this.ingestionForm.get('vcfLocations') as FormArray;
  }

  ingest(value: any) {
    console.log(value);
    const projectName = value.projectName;
    const datasetId = value.datasetId;
    const s3Payload = `s3://${environment.storage.dataPortalBucket}/projects/${projectName}/${value.s3Payload}`;
    const vcfLocations = value.vcfLocations
      .filter((v: any) => v.checked)
      .map(
        (v: any) =>
          `s3://${environment.storage.dataPortalBucket}/projects/${projectName}/${v.name}`,
      );

    this.loading = true;
    this.dps
      .adminIngestToBeacon(projectName, datasetId, s3Payload, vcfLocations)
      .pipe(catchError(() => of(null)))
      .subscribe((res: any) => {
        if (!res) {
          this.sb.open(
            'Operation failed, please check files and try again',
            'Okay',
            { duration: 60000 },
          );
        } else if (!res.success) {
          this.sb.open(res.message, 'Okay', { duration: 60000 });
        } else {
          this.sb.open(
            'Ingested successfully. Perform indexing when you have ingested all your datasets.',
            'Okay',
            { duration: 60000 },
          );
        }
        this.loading = false;
        this.dialogRef.close();
      });
  }
}
