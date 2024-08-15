import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USER_ID_KEY = 'user_id';

  constructor() { }

  setUserId(userId: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.USER_ID_KEY, userId);
    }
  }

  getUserId(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.USER_ID_KEY);
    }
    return null;
  }

  clearUserId(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.USER_ID_KEY);
    }
  }
}
