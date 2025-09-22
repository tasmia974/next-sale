import { Component, ElementRef, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  languages = [
    { code: 'de', label: 'GER', flag: 'assets/img/eng.svg' },
    { code: 'en', label: 'EN', flag: 'assets/img/eng.svg' }
  ];

  selectedLang = this.languages[0];

  constructor(private eRef: ElementRef, private translate: TranslateService) {
    const savedLang = localStorage.getItem('appLanguage');
    if (savedLang) {
      this.selectedLang = this.languages.find(l => l.code === savedLang) ?? this.languages[0];
    }
    this.translate.setDefaultLang(this.selectedLang.code);
    this.translate.use(this.selectedLang.code);
  }


  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (this.isMenuOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.isMenuOpen = false;
    }
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    this.selectedLang = this.languages.find(l => l.code === lang) ?? this.selectedLang;
     localStorage.setItem('appLanguage', lang);
  }

}

