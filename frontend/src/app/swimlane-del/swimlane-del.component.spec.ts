import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwimlaneDelComponent } from './swimlane-del.component';

describe('SwimlaneDelComponent', () => {
  let component: SwimlaneDelComponent;
  let fixture: ComponentFixture<SwimlaneDelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwimlaneDelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SwimlaneDelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
