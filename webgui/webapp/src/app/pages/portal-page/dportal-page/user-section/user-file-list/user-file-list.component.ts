import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Storage } from 'aws-amplify';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DUMMY_DATA_STORAGE } from 'src/app/utils/data';

@Component({
  selector: 'app-user-file-list',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, MatDialogModule],
  templateUrl: './user-file-list.component.html',
  styleUrl: './user-file-list.component.scss',
})
export class UserFileListComponent implements OnInit {
  myFiles: any[] = [];

  constructor(private dg: MatDialog) {}

  ngOnInit(): void {
    this.list();
  }

  async list() {
    const res = await Storage.list(``, {
      pageSize: 'ALL',
      level: 'private',
    });

    console.log('res storage list (res)', res);
    console.log('res storage results (res.results)', res.results);
    // TODO: Update this.myFiles with the results from the Storage.list call
    // this.myFiles = res.results;

    this.myFiles = DUMMY_DATA_STORAGE.results;
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
        await Storage.remove(file.key, { level: 'private' });
        this.myFiles = this.myFiles.filter((f) => f.key !== file.key);
      }
    });
  }
}
