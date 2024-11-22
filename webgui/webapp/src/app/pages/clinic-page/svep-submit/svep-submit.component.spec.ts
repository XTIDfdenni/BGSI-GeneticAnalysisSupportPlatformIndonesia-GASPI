import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvepSubmitComponent } from './svep-submit.component';

describe('SvepSubmitComponent', () => {
  let component: SvepSubmitComponent;
  let fixture: ComponentFixture<SvepSubmitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SvepSubmitComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SvepSubmitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
