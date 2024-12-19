import { Injectable } from '@angular/core';
import { Storage } from 'aws-amplify';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {}

  setBucket(bucket: string, region: string) {
    Storage.configure({
      AWSS3: {
        bucket,
        region,
      },
    });
  }
}
