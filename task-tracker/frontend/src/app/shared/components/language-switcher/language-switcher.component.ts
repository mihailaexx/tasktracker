import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, SelectModule, FormsModule],
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.css']
})
export class LanguageSwitcherComponent {
  languages = [
    { name: 'EN', code: 'en' },
    { name: 'RU', code: 'ru' }
  ];

  selectedLanguage: string;

  constructor(private translate: TranslateService) {
    // Load saved language or default to 'en'
    const savedLang = localStorage.getItem('language');
    this.selectedLanguage = savedLang || 'en';
    this.translate.use(this.selectedLanguage);
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('language', lang);
  }
}
