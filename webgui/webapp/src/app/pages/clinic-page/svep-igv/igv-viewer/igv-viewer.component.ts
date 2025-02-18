import { Component, ElementRef, Input } from '@angular/core';
import igv from 'igv';

@Component({
  selector: 'app-igv-viewer',
  providers: [],
  standalone: true,
  imports: [],
  templateUrl: './igv-viewer.component.html',
  styleUrl: './igv-viewer.component.scss',
})
export class IgvViewerComponent {
  @Input() data!: {
    projectName: string | null;
    bamURL: string | null;
    bamIndex: string | null;
  } | null;

  private igvBrowser: any = null;

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.renderIGV();
  }

  async renderIGV() {
    const igvContainer = this.el.nativeElement.querySelector('.igv-container');

    if (!igvContainer) {
      console.error('Error: IGV container not found.');
      return;
    }

    const options = {
      genome: 'hg38',
      locus: '',
      tracks: [
        {
          url: this.data?.bamURL,
          indexURL: this.data?.bamIndex,
          format: 'bam',
        },
      ],
    };

    try {
      this.igvBrowser = await igv.createBrowser(igvContainer, options);
    } catch (error) {
      console.error('Error initializing IGV.js:', error);
    }
  }

  ngOnDestroy(): void {
    if (this.igvBrowser) {
      this.igvBrowser.removeAllTracks();
      this.igvBrowser = null;
    }
  }
}
