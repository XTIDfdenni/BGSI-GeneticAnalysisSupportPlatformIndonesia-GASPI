import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCreateUserComponent } from './admin-create-user-dialog.component';

describe('AdminCreateUserComponent', () => {
  let component: AdminCreateUserComponent;
  let fixture: ComponentFixture<AdminCreateUserComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminCreateUserComponent],
    });
    fixture = TestBed.createComponent(AdminCreateUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
