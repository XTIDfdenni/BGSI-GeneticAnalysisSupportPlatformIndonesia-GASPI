import { ClipboardModule } from '@angular/cdk/clipboard';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-access-keys-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    ClipboardModule,
    MatTooltipModule,
    MatIconModule,
  ],
  templateUrl: './access-keys-dialog.component.html',
  styleUrl: './access-keys-dialog.component.scss',
})
export class AccessKeysDialogComponent {
  accessKeyId!: string;
  secretAccessKey!: string;
  sessionToken!: string;
  copyString!: string;
  s3uri!: string;

  constructor(private auth: AuthService) {
    this.auth.getKeys().then((keys) => {
      this.accessKeyId = keys.accessKeyId;
      this.secretAccessKey = keys.secretAccessKey;
      this.sessionToken = keys.sessionToken;
      this.s3uri = `s3://${environment.storage.dataPortalBucket}/private/${keys.identityId}/`;
      this.copyString = `export AWS_ACCESS_KEY_ID=${this.accessKeyId}\nexport AWS_SECRET_ACCESS_KEY=${this.secretAccessKey}\nexport AWS_SESSION_TOKEN=${this.sessionToken}`;
    });
  }
}
