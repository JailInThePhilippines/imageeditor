import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../data.service';

@Component({
  selector: 'app-thumbnails',
  templateUrl: './thumbnails.component.html',
  styleUrls: ['./thumbnails.component.css'] 
})
export class ThumbnailsComponent implements OnInit {
  thumbnails: any[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.getPublicThumbnails();
  }

  getPublicThumbnails(): void {
    this.dataService.getPublicThumbnails().subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.thumbnails = response.data;
        } else {
          console.error(response.message);
        }
      },
      (error) => {
        console.error('Error fetching thumbnails:', error);
      }
    );
  }
}
