import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.getUserId()) {
    return true;
  } else {
    router.navigate(['/fallback']); // Redirect to login if not authenticated
    return false;
  }
};
