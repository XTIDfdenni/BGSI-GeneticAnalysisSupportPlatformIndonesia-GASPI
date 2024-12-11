import { Component, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, of } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { DportalService } from 'src/app/services/dportal.service';
import { ComponentSpinnerComponent } from 'src/app/components/component-spinner/component-spinner.component';

interface ProjectFile {
  filename: string;
  hasindex: boolean;
}

interface Project {
  name: string;
  description: string;
  files: ProjectFile[];
  indexed: boolean;
}

export interface FileSelectEvent {
  projectName: string;
  vcf: string;
  index: string;
}

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    ComponentSpinnerComponent,
  ],
  templateUrl: './projects-list.component.html',
  styleUrl: './projects-list.component.scss',
})
export class ProjectsListComponent {
  @Output() filesSelected = new EventEmitter<FileSelectEvent>();
  loading = true;
  dataSource = new MatTableDataSource<Project>();
  displayedColumns: string[] = [
    'name',
    'description',
    'files',
    // 'actions',
  ];
  assignTo: string | null = null;
  viewUsers: string | null = null;
  projectName: string | null = null;
  vcfFile: string | null = null;
  indexFile: string | null = null;

  constructor(
    private dps: DportalService,
    private sb: MatSnackBar,
  ) {
    this.list();
  }

  list() {
    this.loading = true;
    this.dps
      .getMyProjects()
      .pipe(
        catchError((error) => {
          console.error('Error fetching projects:', error); // Log the error
          return of(null); // Return null to continue the stream
        }),
      )
      .subscribe((data: any[]) => {
        if (!data) {
          this.sb.open('API request failed', 'Okay', { duration: 60000 });
          this.dataSource.data = [];
        } else {
          this.dataSource.data = data.map((project) => {
            const vcfFiles = project.files.filter((file: string) =>
              file.endsWith('.vcf.gz'),
            );
            const filesWithStatus = vcfFiles.map((file: string) => {
              const prefix = file.slice(0, -7);
              const hasIndex = project.files.includes(`${prefix}.vcf.gz.tbi`);
              return {
                filename: file,
                disabled: !hasIndex,
              };
            });

            return {
              name: project.name,
              description: project.description,
              files: filesWithStatus,
              indexed: false,
            };
          });
        }
        this.loading = false;
      });
  }

  isFileSelected(fileName: string, projectName: string): boolean {
    return this.vcfFile === fileName && this.projectName === projectName;
  }

  onFileSelect(fileName: string, projectName: string) {
    const fileEvent: FileSelectEvent = {
      projectName: projectName,
      vcf: fileName,
      index: `${fileName}.tbi`,
    };
    this.filesSelected.emit(fileEvent);
  }

  getSelectedFile() {
    return this.vcfFile;
  }
}
