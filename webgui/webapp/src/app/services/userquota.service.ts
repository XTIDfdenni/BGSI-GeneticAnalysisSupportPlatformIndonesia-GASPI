import { Injectable } from '@angular/core';
import { API } from 'aws-amplify';
import { catchError, filter, from, map, Observable, of, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserQuotaService {
  constructor(private auth: AuthService) {}

  getUserQuota(id: string) {
    console.log('get user quota');
    return from(
      API.get(environment.api_endpoint_sbeacon.name, `dportal/quota/${id}`, {}),
    );
  }

  upsertUserQuota(id: string, costEstimation: number | null, usage: any) {
    console.log('upsert user quota');
    return from(
      API.post(environment.api_endpoint_sbeacon.name, 'dportal/quota', {
        body: {
          IdentityUser: id,
          CostEstimation: costEstimation,
          Usage: usage,
        },
      }),
    );
  }

  incrementUsageCount(id: string) {
    console.log('incrementUsageCount');
    return from(
      API.post(
        environment.api_endpoint_sbeacon.name,
        `dportal/quota/${id}/increment_usagecount`,
        {},
      ),
    );
  }

  getCurrentUsage(): Observable<{
    userSub: string;
    quotaQueryCount: number;
    quotaSize: number;
    usageCount: number;
    usageSize: number;
    costEstimation: number;
  }> {
    return this.auth.user.pipe(
      filter((u) => !!u),
      switchMap((u: any) => {
        const userSub = u.attributes.sub;
        return this.getUserQuota(userSub).pipe(
          catchError(() => of(null)),
          map((res) => ({
            userSub,
            quotaQueryCount: res?.Usage.quotaQueryCount || 0,
            usageCount: res?.Usage.usageCount || 0,
            quotaSize: res?.Usage.quotaSize || 0,
            usageSize: res?.Usage.usageSize || 0,
            costEstimation: res?.CostEstimation || 0,
          })),
        );
      }),
    );
  }
}
