import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';

import { SimulationsComponent } from './simulation.component';

describe('SimulationsComponent', () => {
  let component: SimulationsComponent;
  let fixture: ComponentFixture<SimulationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SimulationsComponent, RouterTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null,
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SimulationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
