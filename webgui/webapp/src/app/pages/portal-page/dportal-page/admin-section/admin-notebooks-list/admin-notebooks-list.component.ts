import {
  ChangeDetectorRef,
  Component,
  Injectable,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { DportalService } from 'src/app/services/dportal.service';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  map,
  Observable,
  of,
  Subject,
  switchMap,
} from 'rxjs';
import { AdminNotebookItemComponent } from './admin-notebook-item/admin-notebook-item.component';
import { AwsService } from 'src/app/services/aws.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import {
  MatPaginator,
  MatPaginatorIntl,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';

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

@Injectable()
export class MyCustomPaginatorIntl implements MatPaginatorIntl {
  changes = new Subject<void>();

  // For internationalization, the `$localize` function from
  // the `@angular/localize` package can be used.
  firstPageLabel = $localize`First page`;
  itemsPerPageLabel = $localize`Items per page:`;
  lastPageLabel = $localize`Last page`;

  // You can set labels to an arbitrary string too, or dynamically compute
  // it through other third-party internationalization libraries.
  nextPageLabel = 'Next page';
  previousPageLabel = 'Previous page';

  getRangeLabel(page: number, pageSize: number, length: number): string {
    return $localize`Page ${page + 1}`;
  }
}

@Component({
  selector: 'app-notebooks',
  providers: [{ provide: MatPaginatorIntl, useClass: MyCustomPaginatorIntl }],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    AdminNotebookItemComponent,
    ReactiveFormsModule,
    MatInputModule,
    MatPaginatorModule,
  ],
  templateUrl: './admin-notebooks-list.component.html',
  styleUrl: './admin-notebooks-list.component.scss',
})
export class NotebooksComponent {
  @ViewChildren('notebook') notebookItems?: AdminNotebookItemComponent[];
  notebooks: InstanceInfo[] = [];
  notebooksDataSource: InstanceInfo[] = [];
  notebookCount = 0;
  loading = false;

  searchControl = new FormControl('');
  private searchSubject = new BehaviorSubject<string>(''); // Stores latest search value

  protected pageSize = 3;
  @ViewChild('paginator')
  paginator!: MatPaginator;

  constructor(
    private dps: DportalService,
    private aws: AwsService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.list(0, this.pageSize);
    this.cd.detectChanges();

    this.paginator.page.subscribe((event: PageEvent) => {
      if (this.pageSize != this.paginator.pageSize) {
        this.resetPagination();
        this.refresh();
      } else {
        this.notebooks = this.filterNotebooks(
          this.notebooksDataSource,
          this.searchSubject.value,
          event.pageIndex,
          event.pageSize,
        );
      }
    });

    // Detect changes on search input
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.setSearchInput(value as string);
        this.notebooks = this.filterNotebooks(
          this.notebooksDataSource,
          value as string,
        );
      });
  }

  refresh() {
    this.list(0, this.pageSize);
    this.searchSubject.next('');
    this.searchControl.setValue('');
  }

  resetPagination() {
    this.paginator.pageIndex = 0;
    this.pageSize = this.paginator.pageSize;
  }

  setSearchInput(query: string) {
    this.searchSubject.next(query);
  }

  sliceNotebooks(
    notebooks: InstanceInfo[],
    pageIndex: number,
    pageSize: number,
  ) {
    return notebooks.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
  }

  filterNotebooks(
    notebooks: InstanceInfo[],
    query: string = '',
    pageIndex: number = 0,
    pageSize: number = this.pageSize,
  ): InstanceInfo[] {
    if (!query) {
      this.notebookCount = this.notebooksDataSource.length;
      return this.sliceNotebooks(notebooks, pageIndex, pageSize);
    }

    const lowerCaseQuery = query.toLowerCase();
    const filteredNotebooks = notebooks.filter((n) => {
      return (
        n.instanceName.toLowerCase().includes(lowerCaseQuery) ||
        n.userFirstName.toLowerCase().includes(lowerCaseQuery) ||
        n.userLastName.toLowerCase().includes(lowerCaseQuery) ||
        n.userEmail.toLowerCase().includes(lowerCaseQuery) ||
        n.status.toLowerCase().includes(lowerCaseQuery) ||
        n.instanceType.toLowerCase().includes(lowerCaseQuery) ||
        n.costEstimation.toString().includes(lowerCaseQuery)
      );
    });

    this.notebookCount = filteredNotebooks.length;

    return this.sliceNotebooks(filteredNotebooks, pageIndex, pageSize);
  }

  list(pageIndex: number, pageSize: number) {
    this.loading = true;
    this.dps
      .getAdminNotebooks()
      .pipe(
        catchError(() => of([])),
        switchMap((notebooks) =>
          this.constructListWithCostEstimation(notebooks),
        ),
      )
      .subscribe((notebooksWithCost) => {
        this.notebookCount = notebooksWithCost.length;
        this.notebooksDataSource = notebooksWithCost; // Store original list
        this.notebooks = this.sliceNotebooks(
          notebooksWithCost,
          pageIndex,
          pageSize,
        );
        this.loading = false;
      });
  }

  constructListWithCostEstimation(
    notebooks: InstanceInfo[],
  ): Observable<InstanceInfo[]> {
    if (!notebooks) return of([]);

    const costEstimations$ = notebooks.map((n) =>
      this.aws.calculateTotalPricePerMonth(n.instanceType, n.volumeSize),
    );

    return forkJoin(costEstimations$).pipe(
      map((costEstimations) =>
        notebooks.map((n, index) => ({
          ...n,
          costEstimation: costEstimations[index],
        })),
      ),
    );
  }

  remove(notebook: string) {
    this.notebooks = this.notebooks.filter((n) => n.instanceName !== notebook);
  }
}
