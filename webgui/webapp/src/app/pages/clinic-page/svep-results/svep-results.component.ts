import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
import { ResultsViewerComponent } from './results-viewer/results-viewer.component';
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
  protected requestId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
  ) {
    this.requestIdFormControl = this.fb.control('', [Validators.required]);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['jobId']) {
        this.requestIdFormControl.setValue(params['jobId']);
        this.requestId = params['jobId'];
      } else {
        this.requestIdFormControl.setValue('');
        this.requestId = null;
      }
    });
  }
}
