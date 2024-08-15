import { Component } from '@angular/core';
import { DataService } from '../../../data.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user = {
    name: '',
    email: '',
    password: ''
  };

  constructor(private dataService: DataService, private snackBar: MatSnackBar) { }

  onSubmit() {
    this.dataService.userRegister(this.user).subscribe(
      response => {
        if (response.status === 'success') {
          this.snackBar.open('User registered successfully.', 'Close', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['snackbar-success']
          });
          this.resetForm();
        } else {
          this.snackBar.open('Failed to register user.', 'Close', {
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

  resetForm() {
    this.user = {
      name: '',
      email: '',
      password: ''
    };
  }
}