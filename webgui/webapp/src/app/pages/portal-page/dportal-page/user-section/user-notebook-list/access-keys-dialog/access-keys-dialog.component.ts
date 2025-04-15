import { ClipboardModule } from '@angular/cdk/clipboard';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';
import AWS from 'aws-sdk';

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
export class AccessKeysDialogComponent implements OnInit {
  accessKeyId!: string;
  secretAccessKey!: string;
  sessionToken!: string;
  copyString!: string;
  s3uri!: string;
  script = '';
  json = '';

  constructor(private auth: AuthService) {
    this.auth.getKeys().then((keys) => {
      this.accessKeyId = keys.accessKeyId;
      this.secretAccessKey = keys.secretAccessKey;
      this.sessionToken = keys.sessionToken;
      this.s3uri = `s3://${environment.storage.dataPortalBucket}/private/${keys.identityId}/`;
      this.copyString = `export AWS_ACCESS_KEY_ID=${this.accessKeyId}\nexport AWS_SECRET_ACCESS_KEY=${this.secretAccessKey}\nexport AWS_SESSION_TOKEN=${this.sessionToken}`;
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      const { accessKeyId, secretAccessKey, sessionToken, identityId } =
        await this.auth.getKeys();

      const s3 = new AWS.S3({
        region: environment.auth.region,
        credentials: {
          accessKeyId,
          secretAccessKey,
          sessionToken,
        },
      });
      const res = s3.createPresignedPost({
        Bucket: environment.storage.dataPortalBucket,
        Fields: {
          key: `private/${identityId}/databaseTesting.svg`,
        },
        Expires: 60 * 60,
        Conditions: [
          ['content-length-range', 0, 1024 * 5], // ⚠️ Limit to 5KB
        ],
      });

      this.json = JSON.stringify(res, null, 2);

      const curl = [
        `curl --fail --show-error -v -X POST ${res.url} \\`,
        ...Object.entries(res.fields).map(
          ([k, v]) => `  -F ${JSON.stringify(k)}=${JSON.stringify(v)} \\`,
        ),
        `  -F file=@database.svg`,
      ].join('\n');

      this.script = curl;
    } catch (error) {
      console.error('Error initializing access keys:', error);
    }
  }

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.script).then(() => {
      console.log('Script copied to clipboard!');
    });
  }
}
