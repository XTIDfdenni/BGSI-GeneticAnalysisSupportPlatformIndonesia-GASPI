import { ClipboardModule } from '@angular/cdk/clipboard';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';
import AWS from 'aws-sdk';
import { formatBytes, getTotalStorageSize } from 'src/app/utils/file';
import { Storage } from 'aws-amplify';
import { UserQuotaService } from 'src/app/services/userquota.service';
import { firstValueFrom } from 'rxjs';

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
  totalStorageSize = 0;
  expiredsText = '';
  limitSizeText = '';

  constructor(
    private auth: AuthService,
    private uq: UserQuotaService,
  ) {
    this.auth.getKeys().then((keys) => {
      this.accessKeyId = keys.accessKeyId;
      this.secretAccessKey = keys.secretAccessKey;
      this.sessionToken = keys.sessionToken;
      this.s3uri = `s3://${environment.storage.dataPortalBucket}/private/${keys.identityId}/`;
      this.copyString = `export AWS_ACCESS_KEY_ID=${this.accessKeyId}\nexport AWS_SECRET_ACCESS_KEY=${this.secretAccessKey}\nexport AWS_SESSION_TOKEN=${this.sessionToken}`;
    });
  }

  async generateTotalSize() {
    const res = await Storage.list(``, {
      pageSize: 'ALL',
      level: 'private',
    });

    const bytesTotal = getTotalStorageSize(res.results);
    return bytesTotal;
  }

  async ngOnInit() {
    this.generateCurlCommand();
  }

  async generateCurlCommand(): Promise<void> {
    try {
      const { accessKeyId, secretAccessKey, sessionToken, identityId } =
        await this.auth.getKeys();

      const totalStorageSize = await this.generateTotalSize();
      const { quotaSize: totalQuotaSize } = await firstValueFrom(
        this.uq.getCurrentUsage(),
      );

      const limitSizeInBytes = totalQuotaSize - totalStorageSize;
      const expires = 60 * 60; // 1 hour

      this.expiredsText = `${expires / 60 / 60} Hour${
        expires / 60 / 60 > 1 ? 's' : ''
      }`;

      console.log(limitSizeInBytes);

      this.limitSizeText = formatBytes(limitSizeInBytes, 2);

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
          key: `private/${identityId}/FILE_NAME.format`,
        },
        Expires: 60 * 60,
        Conditions: [
          // ['content-length-range', 0, 1024 * 1], // ⚠️ Limit to 5KB
          ['content-length-range', 0, limitSizeInBytes], // ⚠️ Limit to 5KB
        ],
      });

      this.json = JSON.stringify(res, null, 2);
      const curlHtml = [
        `curl -X POST ${res.url} \\`,
        ...Object.entries(res.fields).map(([k, v]) => {
          if (k === 'key') {
            const formattedKey = v.replace(
              '/FILE_NAME.format',
              '/<b class="text-red-500">file_name.format</b>',
            );
            // Use single quotes in outer HTML to preserve inner HTML
            return `  -F ${k}="${formattedKey}" \\`;
          }
          return `  -F ${k}="${v}" \\`;
        }),
        `  -F file=@<b class="text-red-500">/your/path/to/file.format</b>`,
      ].join('<br>');

      this.script = curlHtml;
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
