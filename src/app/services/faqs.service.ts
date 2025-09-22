import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Faq } from '../models/faqs.model';

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private faqs: Faq[] = [
    {
      question: 'How this Agency is different from others in market?',
      answer: 'It is a long established fact that a reader will be distracted by the readable content...',
      open: true
    },
    {
      question: 'Does this agency supports Business growth ?',
      answer: 'Yes, we provide end-to-end business scaling strategies.'
    },
    {
      question: 'Do you provide any moneyback guarantee in these services?',
      answer: 'Answer not provided.'
    },
    {
      question: 'What payment method do you support?',
      answer: 'We accept credit cards, PayPal, and bank transfers.'
    }
  ];

  getFaqs(): Observable<Faq[]> {
    return of(this.faqs);
  }
}
