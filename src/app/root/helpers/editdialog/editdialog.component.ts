import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-editdialog',
  templateUrl: './editdialog.component.html',
  styleUrls: ['./editdialog.component.css']
})
export class EditdialogComponent implements OnInit {
  brightness: number = 100;
  saturation: number = 100;
  cropShape: string = 'square';
  textTop: string = '';
  textBottom: string = '';
  fontSize: number = 100;
  textTopPosition: number = 10;
  textBottomPosition: number = 90;
  fontColor: string = '#ffffff';
  showEditingOptions: boolean = false;
  showTextOptions: boolean = false;
  showFontSizeOptions: boolean = false;
  showFontColorOptions: boolean = false;
  showBrightnessOptions: boolean = false;
  showSaturationOptions: boolean = false;
  showCropOptions: boolean = false;
  title: string = '';
  description: string = '';

  constructor(
    public dialogRef: MatDialogRef<EditdialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.loadCanvas();
  }

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
    ctx.fillStyle = this.fontColor;
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

  private async loadCanvas(): Promise<void> {
    const img = document.getElementById('imageToEdit') as HTMLImageElement;
    const canvas = document.getElementById('imageCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const proxyUrl = `http://localhost/Gallery/api/proxyImage?url=${encodeURIComponent(this.data.image)}`;
      const dataUrl = await this.fetchImageAsDataUrl(proxyUrl);
      img.src = dataUrl;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
      };
    }
  }
  
  private async fetchImageAsDataUrl(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
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

  saveChanges(): void {
    const editedImage = this.getCanvasDataUrl();
    this.dialogRef.close(editedImage);
  }

  private getCanvasDataUrl(): string {
    const canvas = document.getElementById('imageCanvas') as HTMLCanvasElement;
    return canvas.toDataURL();
  }
}