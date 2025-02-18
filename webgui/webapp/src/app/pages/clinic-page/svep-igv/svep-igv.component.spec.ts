import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvepIGVComponent } from './svep-igv.component';

describe('SvepIGVComponent', () => {
  let component: SvepIGVComponent;
  let fixture: ComponentFixture<SvepIGVComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SvepIGVComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SvepIGVComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
