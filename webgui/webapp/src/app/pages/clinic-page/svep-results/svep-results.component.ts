import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { ResultsViewerComponent } from './results-viewer/results-viewer.component';
import { MatCardModule } from '@angular/material/card';
import { DportalService } from 'src/app/services/dportal.service';

interface Project {
  name: string;
}

@Component({
  selector: 'app-results-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    ResultsViewerComponent,
    MatCardModule,
    MatOptionModule,
    MatSelectModule,
  ],
  providers: [],
  templateUrl: './svep-results.component.html',
  styleUrl: './svep-results.component.scss',
})
export class SvepResultsComponent implements OnInit {
  protected requestIdFormControl: FormControl<string>;
  protected projectNameFormControl: FormControl<string>;
  protected requestId: string | null = null;
  protected projectName: string | null = null;
  protected myProjects: Project[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dps: DportalService,
    private sb: MatSnackBar,
  ) {
    this.requestIdFormControl = this.fb.control('', {
      validators: [Validators.required],
      nonNullable: true,
    });
    this.projectNameFormControl = this.fb.control('', {
      validators: [Validators.required],
      nonNullable: true,
    });
  }

  list() {
    this.dps
      .getMyProjects()
      .pipe(catchError(() => of(null)))
      .subscribe((projects: any) => {
        if (!projects?.data || !Array.isArray(projects.data)) {
          this.sb.open('Unable to get projects.', 'Close', { duration: 60000 });
        } else {
          this.myProjects = projects.data.map((p: Project) => ({
            ...p,
            expanded: false,
          }));
        }
      });
  }

  ngOnInit(): void {
    this.list();

    this.route.queryParams.subscribe((params) => {
      this.requestId = params['jobId'] ?? null;
      this.projectName = params['projectName'] ?? null;
      this.requestIdFormControl.setValue(this.requestId ?? '');
      this.projectNameFormControl.setValue(this.projectName ?? '');
    });
  }
}
