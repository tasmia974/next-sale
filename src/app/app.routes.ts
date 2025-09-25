import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'Home'
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about-us/about-us.component').then(m => m.AboutUsComponent),
    title: 'About Us'
  },
  {
    path: 'services',
    loadComponent: () =>
      import('./pages/services/services.component').then(m => m.ServicesComponent),
    title: 'Services'
  },
  {
    path: 'faq',
    loadComponent: () =>
      import('./pages/faqs/faqs.component').then(m => m.FaqsComponent),
    title: 'FAQ'
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contact'
  },
  {
    path: 'domain-check',
    loadComponent: () =>
      import('./components/domain-check/domain-check.component').then(m => m.DomainCheckComponent)
  },
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: '**',
    loadComponent: () =>
      import('./components/page-not-found/page-not-found.component').then(m => m.PageNotFoundComponent),
    title: 'Page Not Found'
  }
];
