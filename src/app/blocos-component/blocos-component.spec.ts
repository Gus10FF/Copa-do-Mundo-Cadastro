import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlocosComponent } from './blocos-component';

describe('BlocosComponent', () => {
  let component: BlocosComponent;
  let fixture: ComponentFixture<BlocosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BlocosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BlocosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
