import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TheaterTSComponent } from './theater-ts.component';

describe('TheaterTSComponent', () => {
  let component: TheaterTSComponent;
  let fixture: ComponentFixture<TheaterTSComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TheaterTSComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TheaterTSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
