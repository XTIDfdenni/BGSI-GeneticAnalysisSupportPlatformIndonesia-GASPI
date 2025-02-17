import { ChangeDetectorRef, Component } from '@angular/core';
import { ComponentSpinnerComponent } from 'src/app/components/component-spinner/component-spinner.component';
import { DportalService } from 'src/app/services/dportal.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { SpinnerService } from 'src/app/services/spinner.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, of } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface Project {
  name: string;
  description: string;
  files: string[];
  totalSamples: number;
  ingestedDatasets: string[];
}

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [
    ComponentSpinnerComponent,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  templateUrl: './projects-list.component.html',
  styleUrl: './projects-list.component.scss',
})
export class ProjectsListComponent {
  loading = true;
  dataSource = new MatTableDataSource<Project>();
  displayedColumns: string[] = [
    'name',
    'description',
    'files',
    'indexed',
    'actions',
  ];
  active: Project | null = null;

  constructor(
    private dps: DportalService,
    private ss: SpinnerService,
    private sb: MatSnackBar,
    private dg: MatDialog,
    private cd: ChangeDetectorRef,
  ) {
    this.list();
  }

  setActive(project: Project) {
    this.active = project;
    this.cd.detectChanges();

    const element = document.getElementById('addRemoveUsers');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  list() {
    this.loading = true;
    this.dataSource.data = [];
    this.dps
      .getAdminProjects()
      .pipe(catchError(() => of(null)))
      .subscribe((data: any[]) => {
        if (!data) {
          this.sb.open('API request failed', 'Okay', { duration: 60000 });
          this.dataSource.data = [];
        } else {
          this.dataSource.data = data.map((project) => ({
            name: project.name,
            description: project.description,
            files: project.files,
            totalSamples: project.total_samples,
            ingestedDatasets: project.ingested_datasets,
          }));
          if (this.active) {
            this.active =
              this.dataSource.data.find(
                (project) => project.name === this.active?.name,
              ) || null;
          }
        }
        this.loading = false;
      });
  }

  async updateProject(project: Project) {
    const { ProjectUpdateDialogComponent } = await import(
      './project-update-dialog/project-update-dialog.component'
    );

    const dialog = this.dg.open(ProjectUpdateDialogComponent, {
      data: {
        project,
      },
    });

    dialog.afterClosed().subscribe((result) => {
      this.list();
    });
  }

  async index() {
    const { ActionConfirmationDialogComponent } = await import(
      '../../../../../components/action-confirmation-dialog/action-confirmation-dialog.component'
    );

    const dialog = this.dg.open(ActionConfirmationDialogComponent, {
      data: {
        title: 'Build sBeacon Index',
        message:
          'Do this once you have ingested as many new datasets as possible to avoid costs. Are you sure you want to re-index sBeacon?',
      },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.ss.start();
        this.dps
          .adminIndexBeacon()
          .pipe(catchError(() => of(null)))
          .subscribe((res: any) => {
            if (!res) {
              this.sb.open('API request failed', 'Okay', { duration: 60000 });
            } else {
              this.sb.open(
                'Indexing is happening in the background. It might take a few minutes.',
                'Okay',
                { duration: 60000 },
              );
            }
            this.ss.end();
          });
      }
    });
  }

  async delete(name: string) {
    const { ActionConfirmationDialogComponent } = await import(
      '../../../../../components/action-confirmation-dialog/action-confirmation-dialog.component'
    );

    const dialog = this.dg.open(ActionConfirmationDialogComponent, {
      data: {
        title: 'Delete Project',
        message: 'Are you sure you want to delete this project?',
      },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.dps
          .deleteAdminProject(name)
          .pipe(catchError(() => of(null)))
          .subscribe((res: any) => {
            if (!res) {
              this.sb.open('Unable to delete project.', 'Close', {
                duration: 60000,
              });
            } else {
              this.sb.open('Project deleted.', 'Okay', { duration: 60000 });
            }
            this.list();
          });
      }
    });
  }

  async addUserDialog(project: any) {
    const { ProjectAssignmentsDialogComponent } = await import(
      './project-assignments-dialog/project-assignments-dialog.component'
    );

    this.dg.open(ProjectAssignmentsDialogComponent, {
      data: {
        project: project.name,
      },
    });
  }

  async createUploadLink(project: any) {
    const { UploadLinkGenerationDialogComponent } = await import(
      './upload-link-generation-dialog/upload-link-generation-dialog.component'
    );

    this.dg.open(UploadLinkGenerationDialogComponent, {
      data: {
        project: project.name,
      },
    });
  }

  async manageUsersDialog(project: any) {
    const { ProjectUsersDialogComponent } = await import(
      './project-users-dialog/project-users-dialog.component'
    );

    this.dg.open(ProjectUsersDialogComponent, {
      data: {
        project: project.name,
      },
    });
  }

  async ingest(project: any) {
    const { BeaconIngestDialogComponent } = await import(
      './beacon-ingest-dialog/beacon-ingest-dialog.component'
    );

    const dialog = this.dg.open(BeaconIngestDialogComponent, {
      data: {
        project,
      },
    });
    dialog.afterClosed().subscribe((result) => {
      this.list();
    });
  }
}
