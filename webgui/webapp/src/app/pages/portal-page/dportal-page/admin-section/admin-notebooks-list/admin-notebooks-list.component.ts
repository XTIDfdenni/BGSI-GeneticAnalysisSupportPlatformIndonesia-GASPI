import { Component, ViewChildren } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { DportalService } from 'src/app/services/dportal.service';
import { catchError, forkJoin, of } from 'rxjs';
import { AdminNotebookItemComponent } from './admin-notebook-item/admin-notebook-item.component';
import { AwsService } from 'src/app/services/aws.service';

export interface InstanceInfo {
  instanceName: string;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  status: string;
  volumeSize: number;
  instanceType: string;
  costEstimation: number;
}

@Component({
  selector: 'app-notebooks',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    AdminNotebookItemComponent,
  ],
  templateUrl: './admin-notebooks-list.component.html',
  styleUrl: './admin-notebooks-list.component.scss',
})
export class NotebooksComponent {
  @ViewChildren('notebook') notebookItems?: AdminNotebookItemComponent[];
  notebooks: InstanceInfo[] = [];
  loading = false;

  constructor(
    private dps: DportalService,
    private aws: AwsService,
  ) {}

  ngOnInit(): void {
    this.list();
  }

  list() {
    this.notebookItems?.map((n) => n.getStatus());
    this.loading = true;
    this.dps
      .getAdminNotebooks()
      .pipe(catchError(() => of(null)))
      .subscribe((notebooks: InstanceInfo[]) => {
        if (notebooks) {
          this.notebooks = notebooks;
          this.constructListWithCostEstimation();
        }
        this.loading = false;
      });
  }

  constructListWithCostEstimation() {
    if (!this.notebooks) return;

    const costEstimations$ = this.notebooks.map((n) =>
      this.aws.calculateTotalPricePerMonth(n.instanceType, n.volumeSize),
    );

    forkJoin(costEstimations$).subscribe((costEstimations) => {
      this.notebooks = this.notebooks.map((n, index) => ({
        ...n,
        costEstimation: costEstimations[index], // Add the calculated cost
      }));
    });
  }

  remove(notebook: string) {
    this.notebooks = this.notebooks.filter((n) => n.instanceName !== notebook);
  }
}
