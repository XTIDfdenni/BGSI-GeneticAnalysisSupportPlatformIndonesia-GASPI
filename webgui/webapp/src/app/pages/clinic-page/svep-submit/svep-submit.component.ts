import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  FileSelectEvent,
  ProjectsListComponent,
} from './projects-list/projects-list.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { catchError, of } from 'rxjs';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClinicService } from 'src/app/services/clinic.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-submit-page',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatButtonModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    ProjectsListComponent,
    RouterLink,
    MatProgressSpinnerModule,
  ],
  providers: [],
  templateUrl: './svep-submit.component.html',
  styleUrl: './svep-submit.component.scss',
})
export class SvepSubmitComponent {
  @ViewChild('projects') private projects!: ProjectsListComponent;
  protected vcfFile: string | null = null;
  protected indexFile: string | null = null;
  protected valid = false;
  protected submissionStarted = false;
  protected results = null;

  constructor(
    private cs: ClinicService,
    private sb: MatSnackBar,
  ) {}

  filesSelected(event: FileSelectEvent) {
    console.log(event.vcf);
    this.vcfFile = event.vcf;
    this.indexFile = event.index;
    this.valid = true;
  }

  reset() {
    this.projects.list();
    this.submissionStarted = false;
    this.valid = false;
  }

  submit() {
    this.submissionStarted = true;

    if (this.vcfFile) {
      const s3URI = `s3://${environment.storage.dataPortalBucket}/${this.vcfFile}`;

      this.cs
        .submitSvepJob(s3URI)
        .pipe(catchError(() => of(null)))
        .subscribe((response: any) => {
          if (!response) {
            this.sb.open(
              'An error occurred please check your input and try again later',
              'Okay',
              { duration: 60000 },
            );
            return;
          }
          this.results = response.RequestId ?? null;
          this.reset();
        });
    } else {
      this.sb.open('No file selected', 'Okay', { duration: 5000 });
      this.submissionStarted = false;
    }
  }
}
