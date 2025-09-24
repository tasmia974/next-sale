import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomainCheckComponent } from './domain-check.component';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { DomainCheckService } from '../../services/domain-check.service';

describe('DomainCheckComponent', () => {
  let comp: DomainCheckComponent;
  let fixture: ComponentFixture<DomainCheckComponent>;
  let apiSpy: jasmine.SpyObj<DomainCheckService>;

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('DomainCheckService', ['runChecks', 'validateDomain']);
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [DomainCheckComponent],
      providers: [{ provide: DomainCheckService, useValue: apiSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(DomainCheckComponent);
    comp = fixture.componentInstance;
    apiSpy.validateDomain.and.returnValue(of({ valid: true }));
  });

  it('should invalidate bad domain', () => {
    comp.checkForm.controls['domain'].setValue('bad domain');
    expect(comp.checkForm.controls['domain'].valid).toBeFalse();
  });

  it('should accept valid domain', () => {
    comp.checkForm.controls['domain'].setValue('example.com');
    expect(comp.checkForm.controls['domain'].valid).toBeTrue();
  });

  it('should call runChecks when valid', () => {
    apiSpy.runChecks.and.returnValue(of({ submittedBy: { domain: 'example.com', name: null, phone: null }, ssl: {}, mozilla: {}, w3c: {}, pageSpeed: {} }));
    comp.checkForm.setValue({ domain: 'example.com', name: 'John', phone: '+1234567', spamProtection: true });
    comp.onSubmit();
    expect(apiSpy.runChecks).toHaveBeenCalledWith('example.com', 'John', '+1234567');
  });
});
