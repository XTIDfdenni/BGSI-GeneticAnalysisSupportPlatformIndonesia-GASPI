import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from 'src/app/services/auth.service';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dportal-page',
  standalone: true,
  imports: [MatCardModule, AsyncPipe, MatTabsModule, RouterOutlet],
  templateUrl: './portal-page.component.html',
  styleUrl: './portal-page.component.scss',
})
export class PortalPageComponent {
  protected selectedIndex = 0;

  constructor(
    protected auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    const urlTree = this.router.parseUrl(this.router.url);
    console.log(urlTree, 'ini');
  }

  onTabChange(index: number) {
    const routes = ['portal', 'sbeacon-query', 'sbeacon-filter'];
    this.router.navigate([routes[index]], { relativeTo: this.route });
  }
}
