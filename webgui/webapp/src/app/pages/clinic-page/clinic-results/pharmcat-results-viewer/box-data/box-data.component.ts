import { CommonModule } from '@angular/common';
import { Input, signal, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClinicService } from '../../../../../services/clinic.service';
import { PopOverComponent } from '../../svep-results-viewer/box-data/pop-over/pop-over.component';

@Component({
  selector: 'box-data-component-rspon',
  standalone: true,
  imports: [
    MatButtonModule,
    CommonModule,
    MatExpansionModule,
    MatIconModule,
    MatTooltipModule,
    MatCheckboxModule,
    PopOverComponent,
  ],
  templateUrl: './box-data.component.html',
  styleUrl: './box-data.component.scss',
})
export class BoxDataComponent {
  @Input() row: any = null;
  @Input() filterFn!: (mappingIds: string[]) => void;

  togglePanel = false;

  readonly panelOpenState = signal(false);
  constructor(protected cs: ClinicService) {}

  showTooltip(message: string) {
    return `Secondary analysis on this variants reports "${message}" `;
  }

  triggerFilter(value: string[]) {
    if (this.filterFn) {
      this.filterFn(value);
    }
  }

  handleRedirectUrl(column: string, value: string) {
    const urlMap: Record<string, string> = {
      'PubMed IDs': `https://pubmed.ncbi.nlm.nih.gov/${value}/`,
      Variants: `https://www.ncbi.nlm.nih.gov/snp/${value}`,
    };

    const url = urlMap[column];
    window.open(url, '_blank');
  }

  handleColorClignsign(value: string) {
    const lowerValue = value.toLowerCase();
    if (lowerValue.includes('pathogenic')) {
      return '#FB1212';
    } else if (lowerValue.includes('benign')) {
      return '#49750C';
    }

    return '#FF8F73';
  }
}
