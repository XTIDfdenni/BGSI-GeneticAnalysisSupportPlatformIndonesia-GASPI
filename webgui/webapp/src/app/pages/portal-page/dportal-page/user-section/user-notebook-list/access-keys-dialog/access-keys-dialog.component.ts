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
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-access-keys-dialog',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
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
  script = '';
  scriptHtml = '';
  json = '';
  totalStorageSize = 0;
  expiredsText = '';
  limitSizeText = '';

  fileNameForm: FormGroup;

  constructor(
    private auth: AuthService,
    private uq: UserQuotaService,
  ) {
    this.fileNameForm = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(30),
        Validators.pattern('^[a-zA-Z0-9-_.]*$'),
      ]),
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

  async generateCurlCommand(filename: string): Promise<void> {
    try {
      const { accessKeyId, secretAccessKey, sessionToken, identityId } =
        await this.auth.getKeys();

      const totalStorageSize = await this.generateTotalSize();
      const { quotaSize: totalQuotaSize } = await firstValueFrom(
        this.uq.getCurrentUsage(),
      );

      const limitSizeInBytes = Math.floor(totalQuotaSize - totalStorageSize);
      const expires = 60 * 60; // 1 hour

      this.expiredsText = `${expires / 60 / 60} Hour${
        expires / 60 / 60 > 1 ? 's' : ''
      }`;

      console.log('limitSizeInBytes', limitSizeInBytes);
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
          key: `private/${identityId}/${filename}`,
        },
        Expires: 60 * 60,
        Conditions: [['content-length-range', 0, limitSizeInBytes]],
      });

      this.json = JSON.stringify(res, null, 2);

      const curl = [
        `curl -X POST ${res.url} \\`,
        ...Object.entries(res.fields).map(
          ([k, v]) => `  -F ${JSON.stringify(k)}=${JSON.stringify(v)} \\`,
        ),
        `  -F file=@YOUR_FILE.format`,
      ].join('\n');

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

      this.scriptHtml = curlHtml;
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
