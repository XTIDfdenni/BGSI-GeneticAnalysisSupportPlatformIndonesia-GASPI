import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterOutlet, UrlTree } from '@angular/router';

@Component({
  selector: 'app-filters-page',
  templateUrl: './clinic-page.component.html',
  styleUrls: ['./clinic-page.component.scss'],
  standalone: true,
  imports: [MatTabsModule, MatCardModule, RouterOutlet],
  animations: [],
})
export class ClinicPageComponent implements OnInit {
  protected selectedIndex = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.setTabIndex();
  }

  setTabIndex() {
    const urlTree = this.router.parseUrl(this.router.url);
    const path = urlTree.root.children['primary'].segments.join('/');
    if (path.startsWith('clinic/svep-submit')) {
      this.selectedIndex = 0;
    } else if (path.startsWith('clinic/svep-results')) {
      this.selectedIndex = 1;
    }
  }

  ngOnInit() {
    this.router.events.subscribe(() => {
      this.setTabIndex();
    });
  }

  onTabChange(index: number) {
    const routes = ['svep-submit', 'svep-results'];
    this.router.navigate([routes[index]], { relativeTo: this.route });
  }
}
