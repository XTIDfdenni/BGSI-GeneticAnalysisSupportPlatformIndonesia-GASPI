import { Component, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DportalService } from '../../../../services/dportal.service';
import { catchError, of, switchMap, map, defaultIfEmpty } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FileDropperComponent } from '../../file-dropper/file-dropper.component';
import { Storage } from 'aws-amplify';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-data-submission-form',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    FileDropperComponent,
    MatProgressSpinnerModule,
    MatIconModule,
    DecimalPipe,
  ],
  templateUrl: './data-submission-form.component.html',
  styleUrl: './data-submission-form.component.scss',
})
export class DataSubmissionFormComponent {
  @ViewChild(FileDropperComponent) fileDroppper!: FileDropperComponent;
  dataSubmissionForm: FormGroup;
  totalSize = 0;
  progress = 0;
  fileProgress = new Map<string, number>();
  files: File[] = [];

  constructor(
    private fb: FormBuilder,
    private dps: DportalService,
    private sb: MatSnackBar,
  ) {
    this.dataSubmissionForm = this.fb.group({
      projectName: fb.control('', [
        Validators.required,
        Validators.pattern(/^\S.*\S$/),
      ]),
      projectDescription: fb.control('', Validators.required),
    });
  }

  async uploadFile(path: string, file: File): Promise<string> {
    this.fileProgress.set(file.name, 0);
    try {
      await Storage.put(`projects/${path}/${file.name}`, file, {
        customPrefix: { public: '' },
        progressCallback: (progress: { loaded: number; total: number }) => {
          this.fileProgress.set(file.name, progress.loaded);
          this.progress = Array.from(this.fileProgress.values()).reduce(
            (acc, val) => acc + val,
            0,
          );
        },
      });
    } catch (error) {
      console.error('Error uploading file', error);
      throw error;
    }
    return file.name;
  }

  async onSubmit(entry: any) {
    this.dataSubmissionForm.disable();
    const projectName = entry.projectName;
    const projectDescription = entry.projectDescription;
    this.progress = 0;
    this.totalSize = this.files.reduce((acc, file) => acc + file.size, 0);
    this.dps
      .adminCreateProject(projectName, projectDescription)
      .pipe(
        catchError(() => {
          console.error('Error creating project');
          return of(null);
        }),
        switchMap((res: any) => {
          if (res) {
            return forkJoin(
              this.files.map((file) => this.uploadFile(projectName, file)),
            ).pipe(
              defaultIfEmpty(res),
              catchError(() => of(null)),
              map(() => of(res)),
            );
          }
          return of(null);
        }),
      )
      .subscribe((res: any) => {
        console.log('sub', res);
        if (res) {
          this.sb.open('Project created', 'Okay', { duration: 60000 });
          this.reset();
        } else {
          this.sb.open('Project creation failed', 'Okay', { duration: 60000 });
        }
        this.dataSubmissionForm.enable();
      });
  }

  patchFiles(files: FileList) {
    if (files.length + this.files.length > 20) {
      this.sb.open('No more than 20 files per project is allowed!', 'Okay', {
        duration: 60000,
      });
      return;
    }
    this.files = [...this.files, ...Array.from(files)];
  }

  reset() {
    this.dataSubmissionForm.reset();
    this.dataSubmissionForm.enable();
    this.progress = 0;
    this.totalSize = 0;
    this.files = [];
  }

  removeFile(index: number) {
    this.files.splice(index, 1);
  }
}
