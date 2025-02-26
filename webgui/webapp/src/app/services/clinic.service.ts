import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API, Auth } from 'aws-amplify';
import { from, map, Observable, of, switchMap } from 'rxjs';
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

  getSvepResults(
    requestId: string,
    projectName: string,
    chromosome: string | null = null,
    page: number | null = null,
    position: number | null = null
  ): Observable<any> {
    const params = {
      ...(chromosome && { chromosome }),
      ...(page && { page }),
      ...(position && { position }),
    };
  
    return from(
      API.get(environment.api_endpoint_svep.name, 'results', {
        queryStringParameters: {
          request_id: requestId,
          project_name: projectName,
          ...params,
        },
      })
    ).pipe(
      switchMap((res: any) => {
        if (res.url) {
          return this.http
            .get(res.url, { responseType: 'text' })
            .pipe(map((res) => ({ pages: [], content: res, page: 1 })));
        } else {
          return of(res);
        }
      })
    );
  }
}
