import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { catchError, filter, of, switchMap } from 'rxjs';
import { DportalService } from 'src/app/services/dportal.service';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import {
  MatChipEditedEvent,
  MatChipInputEvent,
  MatChipsModule,
} from '@angular/material/chips';

type User = {
  firstName: string;
  lastName: string;
  email: string;
};

const EMAIL_REGEXP =
  /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

@Component({
  selector: 'app-project-assignments',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatChipsModule,
  ],
  templateUrl: './project-assignments-dialog.component.html',
  styleUrl: './project-assignments-dialog.component.scss',
})
export class ProjectAssignmentsDialogComponent {
  project: string;
  users: User[] = [];
  usersAutocomplete: User[] = [];
  emailControl = new FormControl('');
  isEmailValid = (email: string) => (EMAIL_REGEXP.test(email) ? true : false);
  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;

  constructor(
    private dps: DportalService,
    private sb: MatSnackBar,
    public dialogRef: MatDialogRef<ProjectAssignmentsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { project: string },
  ) {
    this.project = data.project;

    this.emailControl.valueChanges
      .pipe(
        filter((email) => !!email && email.length > 2),
        switchMap((email) => this.dps.adminSearchUsers(email!)),
        catchError(() => of([])),
      )
      .subscribe((users: User[]) => {
        this.usersAutocomplete = users;
      });
  }

  displayFn(option: any): string {
    return `Selection ${option}`;
  }

  remove(user: User) {
    this.users = this.users.filter((u) => u.email !== user.email);
  }

  add(event: MatAutocompleteSelectedEvent) {
    this.users = [
      ...new Map(
        [...this.users, event.option.value].map((item) => [item.email, item]),
      ).values(),
    ];
    this.emailControl.patchValue('');
    this.emailInput.nativeElement.value = '';
    this.usersAutocomplete = [];
  }

  async csv(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || file.type !== 'text/plain') {
      this.sb.open(
        'Invalid file format. Only .txt files are allowed.',
        'Close',
        {
          duration: 30000,
        },
      );
      return;
    }

    const load = (): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.addEventListener('load', () => {
          resolve(reader.result as string);
        });
        reader.addEventListener('error', () => {
          reject('Could not read');
        });

        reader.readAsText(file);
      });
    };
    const content = await load();
    const emails = content
      .split('\n')
      .map((e) => e.trim())
      .filter((e) => e.length > 0 && this.isEmailValid(e));
    this.users = [
      ...new Map(
        [
          ...this.users,
          ...emails.map((email) => ({ email, firstName: '', lastName: '' })),
        ].map((item) => [item.email, item]),
      ).values(),
    ];
    (event.target as HTMLInputElement).value = '';
  }

  submit() {
    this.dps
      .adminAddUserToProject(
        this.project,
        this.users.map((u) => u.email),
      )
      .pipe(catchError(() => of(null)))
      .subscribe((res: any) => {
        if (!res) {
          this.sb.open(
            'Unable to add user(s). Please check email(s).',
            'Close',
            {
              duration: 60000,
            },
          );
        } else if (res.success) {
          this.sb.open('User(s) added successfully.', 'Close', {
            duration: 60000,
          });
          this.dialogRef.close();
        } else {
          this.sb.open(`Failed. ${res.message}`, 'Close', {
            duration: 60000,
          });
        }
      });
  }
}
