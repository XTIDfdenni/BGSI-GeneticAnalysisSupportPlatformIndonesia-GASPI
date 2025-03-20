import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  Injectable,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
  MatPaginator,
  MatPaginatorIntl,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { catchError, of, Subject, Subscription } from 'rxjs';
import { ClinicService } from 'src/app/services/clinic.service';
import { SpinnerService } from 'src/app/services/spinner.service';

type SavedVariants = {
  name: string;
  comment: string;
  variants: any[];
  annotations: string[];
  createdAt: string;
  user?: {
    email: string;
    firstName: string;
    lastName: string;
  };
};

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
  selector: 'app-saved-for-reporting-viewer',
  providers: [{ provide: MatPaginatorIntl, useClass: MyCustomPaginatorIntl }],
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
  ],
  templateUrl: './saved-for-reporting-viewer.component.html',
  styleUrl: './saved-for-reporting-viewer.component.scss',
})
export class SavedForReportingViewerComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input({ required: true }) requestId!: string;
  @Input({ required: true }) projectName!: string;
  @ViewChild('paginator')
  paginator!: MatPaginator;
  @ViewChild('downloadLink') downloadLink!: ElementRef<HTMLAnchorElement>;
  protected variants: SavedVariants[] = [];
  protected pageSize = 5;
  private pageTokens = new Map<number, any>();
  private savedVariantsChangedSubscription: Subscription | null = null;

  constructor(
    private cs: ClinicService,
    private sb: MatSnackBar,
    private dg: MatDialog,
    private ss: SpinnerService,
  ) {}

  ngOnInit(): void {
    this.savedVariantsChangedSubscription =
      this.cs.savedVariantsChanged.subscribe(() => {
        this.refresh();
      });
  }

  ngOnDestroy(): void {
    if (this.savedVariantsChangedSubscription) {
      this.savedVariantsChangedSubscription.unsubscribe();
    }
  }

  resetPagination() {
    this.pageTokens = new Map<number, string>();
  }

  refresh() {
    try {
      this.resetPagination();
      this.list(0);
    } catch (error) {
      console.log(error);
    }
  }

  ngOnChanges(_: SimpleChanges): void {
    this.list(0);
  }

  pageChange(event: PageEvent) {
    if (this.pageSize != event.pageSize) {
      this.pageSize = event.pageSize;
      this.resetPagination();
      this.refresh();
    } else {
      this.list(event.pageIndex);
    }
  }

  async deleteSavedVariants(name: string) {
    const { ActionConfirmationDialogComponent } = await import(
      '../../../../components/action-confirmation-dialog/action-confirmation-dialog.component'
    );

    const dialogRef = this.dg.open(ActionConfirmationDialogComponent, {
      data: {
        title: 'Delete Variants',
        message: `Are you sure you want to delete these variants?`,
        confirmText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.ss.start();
        this.cs
          .deleteSavedVariants(this.projectName, this.requestId, name)
          .pipe(catchError(() => of(null)))
          .subscribe((res) => {
            if (res) {
              this.sb.open('Annotation deleted', 'Okay', {
                duration: 5000,
              });
              this.cs.savedVariantsChanged.next();
            } else {
              this.sb.open('Failed to delete annotation', 'Dismiss', {
                duration: 5000,
              });
            }
            this.ss.end();
          });
      }
    });
  }

  generateReport() {
    this.ss.start();
    this.cs
      .generateReport(this.projectName, this.requestId)
      .pipe(catchError(() => of(null)))
      .subscribe((res) => {
        if (res) {
          console.log(res);
          const dataUrl = `data:application/pdf;base64,${res.content}`;
          this.downloadLink.nativeElement.href = dataUrl;
          this.downloadLink.nativeElement.click();
        } else {
          this.sb.open('Failed to generate report', 'Dismiss', {
            duration: 5000,
          });
        }
        this.ss.end();
      });
  }

  list(page: number) {
    // not the first page but the page token is not set
    if (!this.pageTokens.get(page) && page > 0) {
      this.paginator.pageIndex--;
      this.sb.open('No more items to show', 'Okay', { duration: 60000 });
      return;
    }

    this.cs
      .getSavedVariants(
        this.projectName,
        this.requestId,
        this.pageSize,
        this.pageTokens.get(page),
      )
      .pipe(catchError(() => of(null)))
      .subscribe((res) => {
        if (!res) {
          this.sb.open('Failed to load annotations', 'Dismiss', {
            duration: 5000,
          });
        } else {
          //handle if there no data on next page (set page index and last page to prev value)
          if (res.variants.length <= 0 && this.paginator.pageIndex > 0) {
            this.paginator.pageIndex--;
            this.sb.open('No more items to show', 'Okay', { duration: 60000 });
            return;
          }
          this.variants = res.variants;
          // set next page token
          this.pageTokens.set(page + 1, res.last_evaluated_key);
        }
      });
  }
}
