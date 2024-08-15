import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../data.service';
import { AuthService } from '../../../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmdialogComponent } from '../../helpers/confirmdialog/confirmdialog.component';

declare var bootstrap: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  selectedImage: string | ArrayBuffer | null = null;
  fileToUpload: File | null = null;
  title: string = '';
  description: string = '';
  brightness: number = 100;
  saturation: number = 100;
  cropShape: string = 'square';
  textTop: string = '';
  textBottom: string = '';
  fontSize: number = 100;
  textTopPosition: number = 10;
  textBottomPosition: number = 90;
  thumbnails: any[] = [];
  fullSizeImage: string | null = null;
  selectedThumbnail: any = null;
  comments: any[] = [];
  fontColor: string = '#ffffff';
  showEditingOptions: boolean = false;
  showTextOptions: boolean = false;
  showFontSizeOptions: boolean = false;
  showFontColorOptions: boolean = false;
  showBrightnessOptions: boolean = false;
  showSaturationOptions: boolean = false;
  showCropOptions: boolean = false;

  constructor(private dataService: DataService, private authService: AuthService, private snackBar: MatSnackBar, private dialog: MatDialog) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.dataService.getThumbnails(userId).subscribe(response => {
        if (response.status === 'success') {
          this.thumbnails = response.data;
        } else {
          console.error(response.message);
        }
      }, error => {
        console.error(error);
      });
    }
  }

  showFullSizeImage(imagePath: string, thumbnail: any): void {
    this.fullSizeImage = imagePath;
    this.selectedThumbnail = thumbnail;
    const modalElement = document.getElementById('fullSizeImageModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    // Fetch comments for the selected image
    this.getComments(thumbnail.image_id);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const dragDropArea = event.target as HTMLElement;
    dragDropArea.classList.add('dragging');
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const dragDropArea = event.target as HTMLElement;
    dragDropArea.classList.remove('dragging');
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const dragDropArea = event.target as HTMLElement;
    dragDropArea.classList.remove('dragging');

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.fileToUpload = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const target = e.target as FileReader;
        this.selectedImage = target.result;
        const modalElement = document.getElementById('editModal');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        this.loadCanvas();
      };
      reader.readAsDataURL(this.fileToUpload);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fileToUpload = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        const target = e.target as FileReader;
        this.selectedImage = target.result;
        const modalElement = document.getElementById('editModal');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        this.loadCanvas();
      };
      reader.readAsDataURL(file);
    }
  }

  adjustBrightness(event: any): void {
    this.brightness = event.target.value;
    this.applyAllAdjustments();
  }

  adjustSaturation(event: any): void {
    this.saturation = event.target.value;
    this.applyAllAdjustments();
  }

  adjustFontSize(event: any): void {
    this.fontSize = event.target.value;
    this.applyAllAdjustments();
  }

  adjustTextPosition(event: any, position: string): void {
    if (position === 'top') {
      this.textTopPosition = event.target.value;
    } else if (position === 'bottom') {
      this.textBottomPosition = event.target.value;
    }
    this.applyAllAdjustments();
  }

  applyCrop(event: any): void {
    this.cropShape = event.target.value;
    this.applyAllAdjustments();
  }

  applyAllAdjustments(): void {
    const canvas = document.getElementById('imageCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    const img = document.getElementById('imageToEdit') as HTMLImageElement;
    if (ctx && img) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.filter = `brightness(${this.brightness}%) saturate(${this.saturation}%)`;
      ctx.beginPath();
      if (this.cropShape === 'circle') {
        ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2, 0, Math.PI * 2);
      } else if (this.cropShape === 'triangle') {
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(0, canvas.height);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
      } else {
        ctx.rect(0, 0, canvas.width, canvas.height);
      }
      ctx.clip();
      ctx.drawImage(img, 0, 0, img.width, img.height);
      ctx.restore();
      this.addTextToCanvas(ctx, canvas);
    }
  }

  addTextToCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    ctx.font = `${this.fontSize}px Arial`;
    ctx.fillStyle = this.fontColor; // Use the selected font color
    ctx.textAlign = 'center';
    if (this.textTop) {
      ctx.fillText(this.textTop, canvas.width / 2, canvas.height * (this.textTopPosition / 100));
    }
    if (this.textBottom) {
      ctx.fillText(this.textBottom, canvas.width / 2, canvas.height * (this.textBottomPosition / 100));
    }
  }

  applyGrayscale(): void {
    const canvas = document.getElementById('imageCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    const img = document.getElementById('imageToEdit') as HTMLImageElement;
    if (ctx && img) {
      ctx.filter = 'grayscale(100%)';
      ctx.drawImage(img, 0, 0, img.width, img.height);
    }
  }

  uploadImage(): void {
    const userId = this.authService.getUserId();
    const canvas = document.getElementById('imageCanvas') as HTMLCanvasElement;
    if (canvas && userId && this.title && this.description) {
      canvas.toBlob((blob) => {
        if (blob) {
          const formData: FormData = new FormData();
          const randomFileName = this.generateRandomFileName('png');
          formData.append('file', new File([blob], randomFileName));
          formData.append('user_id', userId);
          formData.append('title', this.title);
          formData.append('description', this.description);

          this.dataService.uploadThumbnail(formData).subscribe(response => {
            console.log(response);
            this.snackBar.open('Image uploaded successfully!', 'Dismiss', { duration: 2000 });
            const modalElement = document.getElementById('editModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal.hide();
            // Fetch the updated thumbnails after successful upload
            this.ngOnInit();
          }, error => {
            console.error(error);
            this.snackBar.open('Error uploading image!', 'Dismiss', { duration: 2000 });
          });
        }
      });
    } else {
      console.error('User ID, title, and description are required.');
    }
  }

  private generateRandomFileName(extension: string): string {
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${randomString}.${extension}`;
  }

  private loadCanvas(): void {
    const img = document.getElementById('imageToEdit') as HTMLImageElement;
    const canvas = document.getElementById('imageCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
      };
    }
  }

  addText(position: string): void {
    const text = prompt(`Enter text to add at the ${position}:`);
    if (text !== null) {
      if (position === 'top') {
        this.textTop = text;
      } else if (position === 'bottom') {
        this.textBottom = text;
      }
      this.applyAllAdjustments();
    }
  }

  deleteText(position: string): void {
    if (position === 'bottom') {
      this.textBottom = '';
    } else if (position === 'top') {
      this.textTop = '';
    }
    this.applyAllAdjustments();
  }

  confirmDelete(imageId: number): void {
    const dialogRef = this.dialog.open(ConfirmdialogComponent, {
      width: '250px',
      data: { message: 'Are you sure you want to delete this thumbnail?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteThumbnail(imageId);
      }
    });
  }

  private deleteThumbnail(imageId: number): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.dataService.deleteThumbnail({ image_id: imageId, user_id: userId }).subscribe(response => {
        if (response.status === 'success') {
          this.snackBar.open('Thumbnail deleted successfully!', 'Dismiss', { duration: 2000 });
          // Refresh thumbnails after deletion
          this.ngOnInit();
        } else {
          console.error(response.message);
          this.snackBar.open('Error deleting thumbnail!', 'Dismiss', { duration: 2000 });
        }
      }, error => {
        console.error(error);
        this.snackBar.open('Error deleting thumbnail!', 'Dismiss', { duration: 2000 });
      });
    }
  }

  updateTitle(): void {
    const userId = this.authService.getUserId();
    if (userId && this.selectedThumbnail) {
      const data = {
        image_id: this.selectedThumbnail.image_id,
        user_id: userId,
        title: this.selectedThumbnail.title
      };
      this.dataService.editTitle(data).subscribe(response => {
        if (response.status === 'success') {
          this.snackBar.open('Title updated successfully!', 'Dismiss', { duration: 2000 });
        } else {
          this.snackBar.open('Error updating title!', 'Dismiss', { duration: 2000 });
        }
      }, error => {
        console.error(error);
        this.snackBar.open('Error updating title!', 'Dismiss', { duration: 2000 });
      });
    }
  }

  updateDescription(): void {
    const userId = this.authService.getUserId();
    if (userId && this.selectedThumbnail) {
      const data = {
        image_id: this.selectedThumbnail.image_id,
        user_id: userId,
        description: this.selectedThumbnail.description
      };
      this.dataService.editDescription(data).subscribe(response => {
        if (response.status === 'success') {
          this.snackBar.open('Description updated successfully!', 'Dismiss', { duration: 2000 });
        } else {
          this.snackBar.open('Error updating description!', 'Dismiss', { duration: 2000 });
        }
      }, error => {
        console.error(error);
        this.snackBar.open('Error updating description!', 'Dismiss', { duration: 2000 });
      });
    }
  }

  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  makeThumbnailPublic(imageId: number): void {
    const userId = this.authService.getUserId();
    if (userId) {
      const data = { image_id: imageId, user_id: userId };
      this.dataService.makePublic(data).subscribe(response => {
        if (response.status === 'success') {
          this.snackBar.open('Thumbnail made public successfully!', 'Dismiss', { duration: 2000 });
          // Refresh thumbnails after making public
          this.ngOnInit();
        } else {
          this.snackBar.open('Error making thumbnail public!', 'Dismiss', { duration: 2000 });
        }
      }, error => {
        console.error(error);
        this.snackBar.open('Error making thumbnail public!', 'Dismiss', { duration: 2000 });
      });
    }
  }

  makeThumbnailPrivate(imageId: number): void{
    const userId = this.authService.getUserId();
    if (userId) {
      const data = { image_id: imageId, user_id: userId };
      this.dataService.makePrivate(data).subscribe(response => {
        if (response.status === 'success') {
          this.snackBar.open('Thumbnail made private successfully!', 'Dismiss', { duration: 2000 });
          // Refresh thumbnails after making public
          this.ngOnInit();
        } else {
          this.snackBar.open('Error making thumbnail private!', 'Dismiss', { duration: 2000 });
        }
      }, error => {
        console.error(error);
        this.snackBar.open('Error making thumbnail private!', 'Dismiss', { duration: 2000 });
      });
    }
  }


  getComments(imageId: string): void {
    this.dataService.getComments(imageId).subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.comments = response.data;
          console.log(this.comments);
        } else {
          console.error(response.message);
        }
      },
      (error) => {
        console.error('Error fetching comments:', error);
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

  //revision 1.0
  toggleEditingOptions(): void {
    this.showEditingOptions = !this.showEditingOptions;
  }

  toggleTextOptions(): void {
    this.showTextOptions = !this.showTextOptions;
  }

  toggleFontSizeOptions(): void {
    this.showFontSizeOptions = !this.showFontSizeOptions;
  }

  toggleFontColorOptions(): void {
    this.showFontColorOptions = !this.showFontColorOptions;
  }

  toggleBrightnessOptions(): void {
    this.showBrightnessOptions = !this.showBrightnessOptions;
  }

  toggleSaturationOptions(): void {
    this.showSaturationOptions = !this.showSaturationOptions;
  }

  toggleCropOptions(): void {
    this.showCropOptions = !this.showCropOptions;
  }

}
