import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
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
import { BehaviorSubject, catchError, filter, of } from 'rxjs';
import { ResultsViewerComponent } from './results-viewer/results-viewer.component';
import { ClinicService } from 'src/app/services/clinic.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { MatCardModule } from '@angular/material/card';

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
  ],
  providers: [],
  templateUrl: './svep-results.component.html',
  styleUrl: './svep-results.component.scss',
})
export class SvepResultsComponent implements OnInit {
  protected requestIdFormControl: FormControl;
  protected results: any = null;
  protected requestId: any = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private cs: ClinicService,
    private ss: SpinnerService,
  ) {
    this.requestIdFormControl = this.fb.control('', [Validators.required]);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['jobId']) {
        this.requestIdFormControl.setValue(params['jobId']);
        this.load();
      } else {
        this.requestIdFormControl.setValue('');
        this.results = null;
      }
    });
  }

  async load() {
    this.ss.start();
    this.cs
      .getSvepResults(this.requestIdFormControl.value)
      .pipe(catchError(() => of(null)))
      .subscribe((data) => {
        if (data) {
          this.results = data;
          this.requestId = this.requestIdFormControl.value;
        }
        this.ss.end();
      });
  }
}
