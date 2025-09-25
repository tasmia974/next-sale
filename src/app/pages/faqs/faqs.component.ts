import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Faq } from '../../models/faqs.model';
import { FaqService } from '../../services/faqs.service';
import { AsyncPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-faqs',
  standalone: true,
  imports: [RouterLink,CommonModule],
  templateUrl: './faqs.component.html',
  styleUrl: './faqs.component.scss'
})
export class FaqsComponent {
 faqs!:Faq[];

  constructor(private faqService: FaqService) {}

  ngOnInit() {
    this.faqs = this.faqService.getFaqs();
  }
}
