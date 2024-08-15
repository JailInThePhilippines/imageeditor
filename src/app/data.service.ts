import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private baseURL = 'http://imagegallery.unaux.com/Gallery/api';

  constructor(private http: HttpClient) {}

  userRegister(userData: any): Observable<any> {
    return this.http.post(`${this.baseURL}/register`, userData);
  }

  userLogin(userData: any): Observable<any> {
    return this.http.post(`${this.baseURL}/login`, userData);
  }

  uploadThumbnail(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseURL}/uploadThumbnail`, formData);
  }

  getThumbnails(userId: string): Observable<any> {
    return this.http.get(`${this.baseURL}/getThumbnails/${userId}`);
  }

  deleteThumbnail(data: any): Observable<any> {
    return this.http.post(`${this.baseURL}/deleteThumbnail`, data);
  }

  editTitle(data: any): Observable<any> {
    return this.http.post(`${this.baseURL}/editTitle`, data);
  }

  editDescription(data: any): Observable<any> {
    return this.http.post(`${this.baseURL}/editDescription`, data);
  }

  makePublic(data: any): Observable<any> {
    return this.http.post(`${this.baseURL}/makePublic`, data);
  }

  makePrivate(data: any): Observable<any> {
    return this.http.post(`${this.baseURL}/makePrivate`, data);
  }

  getPublicThumbnails(): Observable<any> {
    return this.http.get(`${this.baseURL}/getPublicThumbnails`);
  }

  getImageDetails(imageId: string): Observable<any> {
    return this.http.get(
      `${this.baseURL}/getImageDetails?image_id=${imageId}`
    );
  }

  addComment(data: any): Observable<any> {
    return this.http.post(`${this.baseURL}/addComment`, data);
  }

  getComments(imageId: string): Observable<any> {
    return this.http.get(`${this.baseURL}/getComments?image_id=${imageId}`);
  }

  deleteComment(data: any): Observable<any> {
    return this.http.post(`${this.baseURL}/deleteComment`, data);
  }

  downloadFile(filePath: string) {
    return this.http.get('http://localhost/Gallery/api/downloadImage', {
      params: { file_path: filePath.replace('http://localhost/Gallery/api/', '') },
      responseType: 'blob'
    });
  }

  saveEditedImage(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseURL}/saveEditedImage`, data);
  }
  

}
