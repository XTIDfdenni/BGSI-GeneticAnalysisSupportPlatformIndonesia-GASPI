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

  submitSvepJob(location: string, projectName: string) {
    return from(Auth.currentCredentials()).pipe(
      switchMap((credentials) => {
        const userId = credentials.identityId;
        return from(
          API.post(environment.api_endpoint_svep.name, 'submit', {
            body: { location, projectName, userId },
          }),
        );
      }),
    );
  }
  
  getSvepResults(requestId: string, projectName: string): Observable<any> {
    return from(
      API.get(environment.api_endpoint_svep.name, 'results', {
        queryStringParameters: {
          request_id: requestId,
          project_name: projectName,
        },
      })
    ).pipe(
      switchMap((res: any) =>
        this.http.get(res.ResultUrl, { responseType: 'text' })
      )
    );
  }
}
