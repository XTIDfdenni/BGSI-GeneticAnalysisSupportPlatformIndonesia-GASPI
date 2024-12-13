import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Storage } from 'aws-amplify';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DUMMY_DATA_STORAGE } from 'src/app/utils/data';
import { AuthService } from 'src/app/services/auth.service';
import { catchError, filter, of } from 'rxjs';
import { DportalService } from 'src/app/services/dportal.service';
import { formatBytes, getTotalSize } from 'src/app/utils/file';

@Component({
  selector: 'app-user-file-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    CommonModule,
  ],
  templateUrl: './user-file-list.component.html',
  styleUrl: './user-file-list.component.scss',
})
export class UserFileListComponent implements OnInit {
  myFiles: any[] = [];

  quotaSize: number = 0;
  quotaSizeFormatted: string = '';

  costEstimation: number = 0;
  loadingUsage: boolean = false;

  totalSize: number = 0;
  totalSizeFormatted: string = '';

  constructor(
    private dg: MatDialog,
    private auth: AuthService,
    private dp: DportalService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.loadList();
  }

  loadList() {
    this.list();
    this.getCurrentUsage();
  }

  generateTotalSize(files: any[]) {
    const bytesTotal = getTotalSize(files);

    this.totalSize = bytesTotal;
    this.totalSizeFormatted = formatBytes(bytesTotal);
  }

  dummyList() {
    this.myFiles = DUMMY_DATA_STORAGE.results;
    this.generateTotalSize(this.myFiles);
  }

  async list() {
    // this.dummyList();

    const res = await Storage.list(``, {
      pageSize: 'ALL',
      level: 'private',
    });

    console.log('res storage list (res)', res);
    console.log('res storage results (res.results)', res.results);
    // TODO: Update this.myFiles with the results from the Storage.list call
    this.myFiles = res.results;
    this.generateTotalSize(this.myFiles);
  }

  getCurrentUsage() {
    this.loadingUsage = true;
    this.auth.user.pipe(filter((u) => !!u)).subscribe((u: any) => {
      const userSub = u.attributes.sub;

      this.dp
        .getUserQuota(userSub)
        .pipe(catchError(() => of(null)))
        .subscribe((res) => {
          this.quotaSize = res?.Usage.quotaSize || 0;
          this.quotaSizeFormatted = formatBytes(this.quotaSize);
          this.costEstimation = res?.CostEstimation || 0;
        });

      this.loadingUsage = false;
    });
  }

  async copy(file: any) {
    const url = await Storage.get(file.key, {
      expires: 3600,
      level: 'private',
    });

    navigator.clipboard
      .writeText(url)
      .then(() => {
        console.log('URL copied to clipboard');
      })
      .catch((err) => {
        console.error('Could not copy URL: ', err);
      });
  }

  async delete(file: any) {
    const { ActionConfirmationDialogComponent } = await import(
      '../../../../../components/action-confirmation-dialog/action-confirmation-dialog.component'
    );

    const dialog = this.dg.open(ActionConfirmationDialogComponent, {
      data: {
        title: 'Delete File',
        message: 'Are you sure you want to delete this file?',
      },
    });
    dialog.afterClosed().subscribe(async (result) => {
      if (result) {
        // await Storage.remove(file.key, { level: 'private' });

        this.myFiles = this.myFiles.filter((f) => f.key !== file.key);

        // Update total size
        this.generateTotalSize(this.myFiles);
      }
    });
  }
}
