import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvepResultsComponent } from './svep-results.component';

describe('SvepResultsComponent', () => {
  let component: SvepResultsComponent;
  let fixture: ComponentFixture<SvepResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SvepResultsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SvepResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
