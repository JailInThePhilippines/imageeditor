import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import {MatMenuModule} from '@angular/material/menu';
import {MatSliderModule} from '@angular/material/slider';
import {MatSelectModule} from '@angular/material/select';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './root/components/home/home.component';
import { LoginComponent } from './root/components/login/login.component';
import { RegisterComponent } from './root/components/register/register.component';
import { NavbarComponent } from './root/components/navbar/navbar.component';
import { ConfirmdialogComponent } from './root/helpers/confirmdialog/confirmdialog.component';
import { ThumbnailsComponent } from './root/components/thumbnails/thumbnails.component';
import { FallbackComponent } from './fallback/fallback.component';
import { PublicviewComponent } from './root/components/publicview/publicview.component';
import { ProfilepictureComponent } from './root/helpers/profilepicture/profilepicture.component';
import { HomeV2Component } from './root/components/home-v2/home-v2.component';
import { PreviewdialogComponent } from './root/helpers/previewdialog/previewdialog.component';
import { EditdialogComponent } from './root/helpers/editdialog/editdialog.component';
import { EditdetailsComponent } from './root/helpers/editdetails/editdetails.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    NavbarComponent,
    ConfirmdialogComponent,
    ThumbnailsComponent,
    FallbackComponent,
    PublicviewComponent,
    ProfilepictureComponent,
    HomeV2Component,
    PreviewdialogComponent,
    EditdialogComponent,
    EditdetailsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatCardModule,
    MatMenuModule,
    MatSliderModule,
    MatSelectModule
  ],
  providers: [
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
