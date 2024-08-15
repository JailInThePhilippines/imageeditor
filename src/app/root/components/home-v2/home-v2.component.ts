import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../data.service';
import { AuthService } from '../../../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmdialogComponent } from '../../helpers/confirmdialog/confirmdialog.component';
import { PreviewdialogComponent } from '../../helpers/previewdialog/previewdialog.component';
import { EditdialogComponent } from '../../helpers/editdialog/editdialog.component';
import { EditdetailsComponent } from '../../helpers/editdetails/editdetails.component';

@Component({
  selector: 'app-home-v2',
  templateUrl: './home-v2.component.html',
  styleUrls: ['./home-v2.component.css']
})
export class HomeV2Component implements OnInit {
  thumbnails: any[] = [];
  selectedFiles: any[] = [];

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId !== null) {
      this.dataService.getThumbnails(userId).subscribe(
        (response) => {
          if (response.status === 'success') {
            this.thumbnails = response.data.map((thumbnail: any) => ({
              ...thumbnail,
              file_path: `http://localhost/Gallery/api/${thumbnail.file_path}`,
              isPublic: thumbnail.is_public
            }));
          } else {
            this.snackBar.open('Failed to load thumbnails', 'Close', { duration: 3000 });
          }
        },
        (error) => {
          console.error('Error fetching thumbnails:', error);
          this.snackBar.open('Error fetching thumbnails', 'Close', { duration: 3000 });
        }
      );
    } else {
      this.snackBar.open('User ID not found', 'Close', { duration: 3000 });
    }
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    this.previewFiles(files);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const files: FileList = event.dataTransfer?.files as FileList;
    this.previewFiles(files);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  previewFiles(files: FileList): void {
    this.selectedFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFiles.push({ file, preview: e.target.result });
      };
      reader.readAsDataURL(file);
    }
    this.openPreviewDialog();
  }

  openPreviewDialog(): void {
    const dialogRef = this.dialog.open(PreviewdialogComponent, {
      width: '80%',
      data: { selectedFiles: this.selectedFiles }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.uploadFiles();
      }
    });
  }

  uploadFiles(): void {
    const formData = new FormData();
    for (let i = 0; i < this.selectedFiles.length; i++) {
      formData.append('file[]', this.selectedFiles[i].file, this.selectedFiles[i].file.name);
    }

    const userId = this.authService.getUserId();
    if (userId === null) {
      this.snackBar.open('User ID not found', 'Close', { duration: 3000 });
      return;
    }

    formData.append('user_id', userId);

    this.dataService.uploadThumbnail(formData).subscribe(
      (response) => {
        this.snackBar.open('Files uploaded successfully', 'Close', { duration: 3000 });
        this.ngOnInit();
      },
      (error) => {
        console.error('Upload error:', error);
        this.snackBar.open('Failed to upload files', 'Close', { duration: 3000 });
      }
    );
  }

  confirmDelete(imageId: string): void {
    const dialogRef = this.dialog.open(ConfirmdialogComponent, {
      width: '300px',
      data: { message: 'Are you sure you want to delete this thumbnail?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteThumbnail(imageId);
      }
    });
  }

  deleteThumbnail(imageId: string): void {
    const userId = this.authService.getUserId();
    if (userId === null) {
      this.snackBar.open('User ID not found', 'Close', { duration: 3000 });
      return;
    }

    const data = { image_id: imageId, user_id: userId };
    this.dataService.deleteThumbnail(data).subscribe(
      (response) => {
        if (response.status === 'success') {
          this.snackBar.open('Thumbnail deleted successfully', 'Close', { duration: 3000 });
          this.ngOnInit(); // Reload thumbnails after deletion
        } else {
          this.snackBar.open('Failed to delete thumbnail', 'Close', { duration: 3000 });
        }
      },
      (error) => {
        console.error('Error deleting thumbnail:', error);
        this.snackBar.open('Error deleting thumbnail', 'Close', { duration: 3000 });
      }
    );
  }

  makePublic(imageId: string): void {
    const userId = this.authService.getUserId();
    if (userId === null) {
      this.snackBar.open('User ID not found', 'Close', { duration: 3000 });
      return;
    }

    const data = { image_id: imageId, user_id: userId };
    this.dataService.makePublic(data).subscribe(
      (response) => {
        if (response.status === 'success') {
          this.snackBar.open('Thumbnail made public', 'Close', { duration: 3000 });
          this.ngOnInit(); // Reload thumbnails after update
        } else {
          this.snackBar.open('Failed to make thumbnail public', 'Close', { duration: 3000 });
        }
      },
      (error) => {
        console.error('Error making thumbnail public:', error);
        this.snackBar.open('Error making thumbnail public', 'Close', { duration: 3000 });
      }
    );
  }

  // Method to make a thumbnail private
  makePrivate(imageId: string): void {
    const userId = this.authService.getUserId();
    if (userId === null) {
      this.snackBar.open('User ID not found', 'Close', { duration: 3000 });
      return;
    }

    const data = { image_id: imageId, user_id: userId };
    this.dataService.makePrivate(data).subscribe(
      (response) => {
        if (response.status === 'success') {
          this.snackBar.open('Thumbnail made private', 'Close', { duration: 3000 });
          this.ngOnInit(); // Reload thumbnails after update
        } else {
          this.snackBar.open('Failed to make thumbnail private', 'Close', { duration: 3000 });
        }
      },
      (error) => {
        console.error('Error making thumbnail private:', error);
        this.snackBar.open('Error making thumbnail private', 'Close', { duration: 3000 });
      }
    );
  }

  editThumbnail(imageId: string): void {
    const thumbnail = this.thumbnails.find(t => t.image_id === imageId);
    const dialogRef = this.dialog.open(EditdialogComponent, {
      width: '80%', // Adjust the width as needed
      height: '80%', // Adjust the height as needed
      panelClass: 'custom-dialog-container', // Add custom class
      data: { image: thumbnail.file_path }
    });
  
    dialogRef.afterClosed().subscribe(editedImage => {
      if (editedImage) {
        this.saveEditedImage(imageId, editedImage);
      }
    });
  }
  
  saveEditedImage(imageId: string, editedImage: string): void {
    const userId = this.authService.getUserId();
    if (userId === null) {
      this.snackBar.open('User ID not found', 'Close', { duration: 3000 });
      return;
    }
  
    const data = { image_id: imageId, user_id: userId, edited_image: editedImage };
    this.dataService.saveEditedImage(data).subscribe(
      (response) => {
        if (response.status === 'success') {
          this.snackBar.open('Image edited successfully', 'Close', { duration: 3000 });
          this.ngOnInit(); // Reload thumbnails after edit
        } else {
          this.snackBar.open('Failed to edit image', 'Close', { duration: 3000 });
        }
      },
      (error) => {
        console.error('Error editing image:', error);
        this.snackBar.open('Error editing image', 'Close', { duration: 3000 });
      }
    );
  }

  openEditDetailsDialog(imageId: string, field: string): void {
    const thumbnail = this.thumbnails.find(t => t.image_id === imageId);
    const dialogRef = this.dialog.open(EditdetailsComponent, {
      width: '400px',
      data: { imageId, field, value: thumbnail[field] }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveEditedDetails(imageId, field, result);
      }
    });
  }
  
  saveEditedDetails(imageId: string, field: string, value: string): void {
    const userId = this.authService.getUserId();
    if (userId === null) {
      this.snackBar.open('User ID not found', 'Close', { duration: 3000 });
      return;
    }
  
    const data = { image_id: imageId, user_id: userId, [field]: value };
    const serviceMethod = field === 'title' ? this.dataService.editTitle(data) : this.dataService.editDescription(data);
  
    serviceMethod.subscribe(
      (response) => {
        if (response.status === 'success') {
          this.snackBar.open(`${field.charAt(0).toUpperCase() + field.slice(1)} edited successfully`, 'Close', { duration: 3000 });
          this.ngOnInit(); // Reload thumbnails after edit
        } else {
          this.snackBar.open(`Failed to edit ${field}`, 'Close', { duration: 3000 });
        }
      },
      (error) => {
        console.error(`Error editing ${field}:`, error);
        this.snackBar.open(`Error editing ${field}`, 'Close', { duration: 3000 });
      }
    );
  }

  downloadImage(filePath: string): void {
    this.dataService.downloadFile(filePath).subscribe(
      (blob: Blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filePath.split('/').pop() || 'download';
        link.click();
        window.URL.revokeObjectURL(link.href);
      },
      (error) => {
        console.error('Error downloading file:', error);
      }
    );
  }

}
