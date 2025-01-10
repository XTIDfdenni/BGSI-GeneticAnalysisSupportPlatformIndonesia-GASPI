import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { catchError, of } from 'rxjs';
import { DportalService } from 'src/app/services/dportal.service';

@Component({
  selector: 'app-admin-folder-list',
  standalone: true,
  imports: [
    MatSnackBarModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './admin-folder-list.component.html',
  styleUrl: './admin-folder-list.component.scss',
})
export class AdminFolderListComponent implements OnInit {
  displayedColumns: string[] = ['given_name', 'family_name', 'email', 'action'];
  dataSource: any[] = [];
  inactiveIdentities: any[] = [];

  constructor(
    private dps: DportalService,
    private sb: MatSnackBar,
    private dg: MatDialog,
  ) {}

  ngOnInit(): void {
    this.list();
  }

  list() {
    this.dps
      .adminGetUserFolders()
      .pipe(catchError(() => of(null)))
      .subscribe((data) => {
        if (!data) {
          this.sb.open('Error fetching folders', 'close', {
            duration: 60000,
          });
        } else {
          this.dataSource = data.active;
          this.inactiveIdentities = data.inactive;
        }
      });
  }

  async deleteFolder(folder: string) {
    const { ActionConfirmationDialogComponent } = await import(
      'src/app/components/action-confirmation-dialog/action-confirmation-dialog.component'
    );

    const dialog = this.dg.open(ActionConfirmationDialogComponent, {
      data: {
        title: 'Delete User Folder',
        message: 'Are you sure you want to delete this user folder?',
      },
    });

    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.dps
          .adminDeleteUserFolder(folder)
          .pipe(catchError(() => of(null)))
          .subscribe((data) => {
            if (!data) {
              this.sb.open('Error deleting folder', 'close', {
                duration: 60000,
              });
            } else {
              this.list();
            }
          });
      }
    });
  }
}
