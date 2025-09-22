import { Injectable } from '@angular/core';
import { Testimonial } from '../models/testimonial.modal';

export interface Slide {
  testimonials: Testimonial[];
}

@Injectable({
  providedIn: 'root'
})
export class TestimonialService {

  private slides: Slide[] = [
    {
      testimonials: [
        {
          name: 'Robert Lawsen',
          title: 'Director of Innovation',
          quote: 'I am absolutely thrilled with the exceptional services provided by Digilink Digital Agency. From the moment I engaged with them, their team demonstrated a deep understanding of my business needs and goals.',
          avatar: 'assets/img/client-1.svg',
          rating: 5.0
        },
        {
          name: 'Jhoan Cruyft',
          title: 'Web Developer',
          quote: 'Working with Digilink Digital Agency has been a game-changer for my e-commerce business. Their comprehensive e-commerce solutions have not only boosted our online sales but also streamlined our operations.',
          avatar: 'assets/img/client2.svg',
          rating: 5.0
        },
        {
          name: 'Vixel Sabran',
          title: 'Content Manager',
          quote: 'As a startup trying to establish a strong online presence, Digilink provided us with the perfect support we needed. Their collaborated dynamic team brought fresh ideas to the table and collaborated closely with us.',
          avatar: 'assets/img/client3.svg',
          rating: 5.0
        }
      ]
    }
  ];

  constructor() { }

  getSlides(): Slide[] {
    return this.slides;
  }
}
