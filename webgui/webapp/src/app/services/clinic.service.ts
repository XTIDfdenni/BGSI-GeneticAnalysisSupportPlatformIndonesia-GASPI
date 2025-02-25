import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API, Auth } from 'aws-amplify';
import { from, Observable, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ClinicService {
  constructor(private http: HttpClient) {}

  submitSvepJob(location: string) {
    return from(Auth.currentCredentials()).pipe(
      switchMap((credentials) => {
        const userId = credentials.identityId;
        return from(
          API.post(environment.api_endpoint_svep.name, 'submit', {
            body: { location, userId },
          }),
        );
      }),
    );
  }

  getSvepResults(requestId: string): Observable<any> {
    return from(Auth.currentCredentials()).pipe(
      switchMap((credentials) => {
        const userId = credentials.identityId;
        return from(
          API.get(environment.api_endpoint_svep.name, 'results', {
            queryStringParameters: {
              request_id: requestId,
              user_id: userId,
            },
          }),
        ).pipe(
          switchMap((res: any) =>
            this.http.get(res.ResultUrl, { responseType: 'text' }),
          ),
        );
      }),
    );
  }
}
