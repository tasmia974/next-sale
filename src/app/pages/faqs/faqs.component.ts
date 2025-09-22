import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Faq } from '../../models/faqs.model';
import { Observable } from 'rxjs';
import { FaqService } from '../../services/faqs.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-faqs',
  standalone: true,
  imports: [RouterLink,AsyncPipe],
  templateUrl: './faqs.component.html',
  styleUrl: './faqs.component.scss'
})
export class FaqsComponent {
 faqs$!: Observable<Faq[]>;

  constructor(private faqService: FaqService) {}

  ngOnInit() {
    this.faqs$ = this.faqService.getFaqs();
  }
}
