import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-editdetails',
  templateUrl: './editdetails.component.html',
  styleUrl: './editdetails.component.css'
})
export class EditdetailsComponent {
  constructor(
    public dialogRef: MatDialogRef<EditdetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onSave(): void {
    this.dialogRef.close(this.data.value);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
