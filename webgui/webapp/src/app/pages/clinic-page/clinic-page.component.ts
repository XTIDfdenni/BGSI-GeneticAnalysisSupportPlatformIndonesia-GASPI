import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';

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
    const urlTree = this.router.parseUrl(this.router.url);
    this.selectedIndex =
      urlTree.root.children['primary'].segments.at(-1)?.toString() ===
      'svep-results'
        ? 1
        : 0;
  }

  ngOnInit() {
    this.router.events.subscribe(() => {
      const urlTree = this.router.parseUrl(this.router.url);
      this.selectedIndex =
        urlTree.root.children['primary'].segments.at(-1)?.toString() ===
        'svep-results'
          ? 1
          : 0;
    });
  }

  onTabChange(index: number) {
    const routes = ['svep-submit', 'svep-results'];
    this.router.navigate([routes[index]], { relativeTo: this.route });
  }
}
