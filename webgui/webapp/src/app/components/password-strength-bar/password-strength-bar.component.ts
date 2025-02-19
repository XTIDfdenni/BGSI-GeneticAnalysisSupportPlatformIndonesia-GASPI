import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-password-strength-bar',
  standalone: true,
  imports: [],
  templateUrl: './password-strength-bar.component.html',
  styleUrl: './password-strength-bar.component.scss',
})
export class PasswordStrengthBarComponent {
  @Input({ required: true }) password!: string;

  public isStrongPassword(password: string): boolean {
    return this.getPasswordStrength(password) == 5;
  }

  hasLowerCaseLetter(password: string): boolean {
    return /[a-z]+/.test(password);
  }

  hasUpperCaseLetter(password: string): boolean {
    return /[A-Z]+/.test(password);
  }

  hasNumber(password: string): boolean {
    return /[0-9]+/.test(password);
  }

  hasSpecialCharacter(password: string): boolean {
    return /[!@#$%^&*]+/.test(password);
  }

  hasCorrectLength(password: string): boolean {
    return password.length >= 8;
  }

  getPasswordStrength(password: string): number {
    let strength = 0;
    if (this.hasLowerCaseLetter(password)) {
      strength++;
    }
    if (this.hasUpperCaseLetter(password)) {
      strength++;
    }
    if (this.hasNumber(password)) {
      strength++;
    }
    if (this.hasSpecialCharacter(password)) {
      strength++;
    }
    if (this.hasCorrectLength(password)) {
      strength++;
    }
    return strength;
  }
}
