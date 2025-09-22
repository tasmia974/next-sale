import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { DomainCheckComponent } from './components/domain-check/domain-check.component';
import { HomeComponent } from './pages/home/home.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { ServicesComponent } from './pages/services/services.component';
import { FaqsComponent } from './pages/faqs/faqs.component';
import { ContactComponent } from './pages/contact/contact.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Home' },
  { path: 'about', component: AboutUsComponent, title: 'About Us' },
  { path: 'services', component: ServicesComponent, title: 'Services' },
  { path: 'faq', component: FaqsComponent, title: 'FAQ' },
  { path: 'contact', component: ContactComponent, title: 'Contact' },
  { path: 'domain-check', component: DomainCheckComponent },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent, title: 'Page Not Found' }
];


// import { Routes } from '@angular/router';

// export const routes: Routes = [
//   {
//     path: '',
//     loadComponent: () =>
//       import('./pages/home/home.component').then(m => m.HomeComponent),
//     title: 'Home'
//   },
//   {
//     path: 'about',
//     loadComponent: () =>
//       import('./pages/about-us/about-us.component').then(m => m.AboutUsComponent),
//     title: 'About Us'
//   },
//   {
//     path: 'services',
//     loadComponent: () =>
//       import('./pages/services/services.component').then(m => m.ServicesComponent),
//     title: 'Services'
//   },
//   {
//     path: 'faq',
//     loadComponent: () =>
//       import('./pages/faqs/faqs.component').then(m => m.FaqsComponent),
//     title: 'FAQ'
//   },
//   {
//     path: 'contact',
//     loadComponent: () =>
//       import('./pages/contact/contact.component').then(m => m.ContactComponent),
//     title: 'Contact'
//   },
//   {
//     path: 'domain-check',
//     loadComponent: () =>
//       import('./components/domain-check/domain-check.component').then(m => m.DomainCheckComponent)
//   },
//   {
//     path: 'home',
//     redirectTo: '',
//     pathMatch: 'full'
//   },
//   {
//     path: '**',
//     loadComponent: () =>
//       import('./components/page-not-found/page-not-found.component').then(m => m.PageNotFoundComponent),
//     title: 'Page Not Found'
//   }
// ];
