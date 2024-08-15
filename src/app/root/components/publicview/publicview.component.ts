import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../../data.service';
import { AuthService } from '../../../auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmdialogComponent } from '../../helpers/confirmdialog/confirmdialog.component';

@Component({
  selector: 'app-publicview',
  templateUrl: './publicview.component.html',
  styleUrls: ['./publicview.component.css']
})
export class PublicviewComponent implements OnInit {
  imageDetails: any;
  newComment: string = '';
  comments: any[] = [];
  userId: string | null = null;
  imageList: any[] = [];
  currentIndex: number = 0;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    console.log('User ID:', this.userId); // Debugging line
  
    this.dataService.getPublicThumbnails().subscribe((response: any) => {
      if (response.status === 'success') {
        this.imageList = response.data;
        this.route.paramMap.subscribe(params => {
          const imageId = params.get('image_id') as string;
          if (imageId) {
            this.currentIndex = this.imageList.findIndex(image => image.image_id === parseInt(imageId, 10));
            if (this.currentIndex === -1) {
              console.error('Image ID not found in the list');
              return;
            }
            this.getImageDetails(imageId);
            this.getComments(imageId);
          } else {
            console.error('Image ID not found in route');
          }
        });
      } else {
        console.error(response.message);
      }
    });
  
    // Manually trigger change detection
    this.cdr.detectChanges();
  }  

  getImageDetails(imageId: string): void {
    this.dataService.getImageDetails(imageId).subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.imageDetails = response.data;
        } else {
          console.error(response.message);
        }
      },
      (error) => {
        console.error('Error fetching image details:', error);
      }
    );
  }

  getComments(imageId: string): void {
    this.dataService.getComments(imageId).subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.comments = response.data
            .map((comment: any) => ({
              ...comment,
              user_id: comment.user_id.toString()
            }))
            .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        } else {
          console.error(response.message);
        }
      },
      (error) => {
        console.error('Error fetching comments:', error);
      }
    );
  }

  addComment(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('User not logged in');
      return;
    }

    if (this.newComment.trim()) {
      const commentData = {
        comment: this.newComment,
        user_id: userId,
        image_id: this.imageDetails.image_id
      };

      this.dataService.addComment(commentData).subscribe(
        (response: any) => {
          if (response.status === 'success') {
            this.comments.unshift({
              ...response.data,
              user_id: response.data.user_id.toString()
            });
            this.newComment = '';
          } else {
            console.error(response.message);
          }
        },
        (error) => {
          console.error('Error adding comment:', error);
        }
      );
    }
  }

  deleteComment(commentId: string): void {
    const dialogRef = this.dialog.open(ConfirmdialogComponent, {
      width: '250px',
      data: { message: 'Are you sure you want to delete this comment?' }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const userId = this.authService.getUserId();
        if (!userId) {
          console.error('User not logged in');
          return;
        }
  
        const commentData = {
          comment_id: commentId,
          user_id: userId
        };
  
        this.dataService.deleteComment(commentData).subscribe(
          (response: any) => {
            if (response.status === 'success') {
              this.comments = this.comments.filter(comment => comment.comment_id !== commentId);
            } else {
              console.error(response.message);
            }
          },
          (error) => {
            console.error('Error deleting comment:', error);
          }
        );
      }
    });
  }

  openImageInFullSize(): void {
    window.open('http://localhost/Gallery/api/' + this.imageDetails.file_path, '_blank');
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

  goBack(): void {
    this.router.navigate(['/thumbnails']);
  }

  navigateImage(direction: string): void {
    if (direction === 'next') {
      this.currentIndex = (this.currentIndex + 1) % this.imageList.length;
    } else if (direction === 'previous') {
      this.currentIndex = (this.currentIndex - 1 + this.imageList.length) % this.imageList.length;
    }
    
    const nextImageId = this.imageList[this.currentIndex].image_id;
    this.router.navigate(['/publicview', nextImageId]);
    this.getImageDetails(nextImageId);
    this.getComments(nextImageId);
  }
  
}
