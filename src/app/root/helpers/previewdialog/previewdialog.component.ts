import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-previewdialog',
  templateUrl: './previewdialog.component.html',
  styleUrl: './previewdialog.component.css'
})
export class PreviewdialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PreviewdialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onUpload(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  removeFile(index: number): void {
    this.data.selectedFiles.splice(index, 1);
  }
}
