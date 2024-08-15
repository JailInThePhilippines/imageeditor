import { Component } from '@angular/core';
import { DataService } from '../../../data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  user = {
    email: '',
    password: ''
  };

  constructor(
    private dataService: DataService,
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: AuthService
  ) { }

  onSubmit() {
    this.dataService.userLogin(this.user).subscribe(
      response => {
        if (response.status === 'success') {
          // Assuming response contains user data inside `user` key
          const userId = response.user.user_id;
          this.authService.setUserId(userId);

          this.snackBar.open('Login successful.', 'Close', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['snackbar-success']
          });
          this.router.navigate(['/home-v2']);
        } else {
          this.snackBar.open('Invalid email or password.', 'Close', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['snackbar-error']
          });
        }
      },
      error => {
        console.error('Error:', error);
        this.snackBar.open('An error occurred.', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['snackbar-error']
        });
      }
    );
  }
}
