import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  ViewChild,
} from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import * as _ from 'lodash';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-tabular-query-results-viewer',
  templateUrl: './tabular-query-results-viewer.component.html',
  styleUrl: './tabular-query-results-viewer.component.scss',
  standalone: true,
  imports: [
    MatCardModule,
    MatTableModule,
    NgxJsonViewerModule,
    MatPaginatorModule,
    MatIconModule,
    ClipboardModule,
    MatButtonModule,
    MatTooltipModule,
  ],
})
export class TabularQueryResultsViewerComponent
  implements OnChanges, AfterViewInit
{
  @Input({ required: true })
  results: any;
  @ViewChild('paginator')
  paginator!: MatPaginator;
  protected _ = _;
  protected displayedColumns: string[] = [];
  protected dataSource = new MatTableDataSource<any>([]);

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges(): void {
    const results = _.isEmpty(this.results.response.resultSets)
      ? this.results.response.collections
      : this.results.response.resultSets[0].results;
    // Handle the special case for variants
    const idName = _.isEmpty(results[0]['id']) ? 'variantInternalId' : 'id';
    // expand out info column for non-variants
    const processedResults = results.map((item: any) => {
      if (!item.variantInternalId) {
        const { projectName = '', datasetName = '', additionalInfo = '' } = item.info || {};
        return {
          ...item,
          projectName,
          datasetName,
          info: additionalInfo,
        };
      }
      return item;
    });
  
    const header = [
      idName,
      ..._.filter(
        _.keys(processedResults[0]),
        (item) => item !== idName
      ),
    ];
    const data = _.map(processedResults, (item) => _.pick(item, header));
  
    this.displayedColumns = header;
    this.dataSource = new MatTableDataSource<any>(data);
    this.dataSource.paginator = this.paginator;
  }
}  