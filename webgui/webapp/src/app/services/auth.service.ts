import { Injectable } from '@angular/core';
import { Auth, Hub } from 'aws-amplify';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import _ from 'lodash';
import { CustomReuseStrategy } from '../app.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public user = new BehaviorSubject<any | null>(null);
  public userGroups = new BehaviorSubject<Set<string>>(new Set([]));
  private tempUser: any = null;

  constructor(
    private router: Router,
    private routerReuseStrategy: CustomReuseStrategy,
  ) {
    this.refresh();
    Hub.listen('auth', async ({ payload: { event, data } }) => {
      switch (event) {
        case 'signOut':
          this.routerReuseStrategy.resetHandlers();
          this.refresh();
          this.router.navigate(['/login']);
          break;
      }
    });
  }

  async signIn(username: string, password: string) {
    try {
      const user = await Auth.signIn(username, password);

      if (_.get(user, 'challengeName', '') === 'NEW_PASSWORD_REQUIRED') {
        this.tempUser = user;
        return 'NEW_PASSWORD_REQUIRED';
      }
      console.log('Logged in as ', user);
      await this.refresh();
      return true;
    } catch (error) {
      console.log('error signing in', error);
      return false;
    }
  }

  async getKeys() {
    const creds = await Auth.currentCredentials();
    return {
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey,
      sessionToken: creds.sessionToken,
      identityId: creds.identityId,
    };
  }

  async newPassword(newPassword: string) {
    await Auth.completeNewPassword(this.tempUser, newPassword);
    await this.refresh();
    return true;
  }

  async signOut() {
    this.routerReuseStrategy.resetHandlers();
    await Auth.signOut();
    this.refresh();
    this.router.navigate(['/login']);
  }

  async refresh() {
    try {
      const creds = await Auth.currentCredentials();
      let user = await Auth.currentAuthenticatedUser();
      console.log('User', user);
      console.log('Identity', creds.identityId);

      if (user.attributes['custom:identity_id'] != creds.identityId) {
        console.log('Updating identity_id');
        await Auth.updateUserAttributes(user, {
          'custom:identity_id': creds.identityId,
        });
        user = await Auth.currentAuthenticatedUser();
      }

      this.userGroups.next(
        new Set(user.signInUserSession.idToken.payload['cognito:groups']),
      );
      this.user.next(user);
      return true;
    } catch (error) {
      this.userGroups.next(new Set([]));
      this.user.next(null);
      return false;
    }
  }

  async forgotPassword(username: string) {
    return await Auth.forgotPassword(username);
  }
}
