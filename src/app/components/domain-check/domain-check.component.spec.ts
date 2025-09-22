import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DomainCheckComponent } from './domain-check.component';

describe('DomainCheckComponent', () => {
  let component: DomainCheckComponent;
  let fixture: ComponentFixture<DomainCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DomainCheckComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DomainCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
