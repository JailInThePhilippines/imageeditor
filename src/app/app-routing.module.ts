import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './root/components/login/login.component';
import { RegisterComponent } from './root/components/register/register.component';
import { HomeComponent } from './root/components/home/home.component';
import { ThumbnailsComponent } from './root/components/thumbnails/thumbnails.component';
import { authGuard } from './auth.guard';
import { FallbackComponent } from './fallback/fallback.component';
import { PublicviewComponent } from './root/components/publicview/publicview.component';
import { HomeV2Component } from './root/components/home-v2/home-v2.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'home-v2', component: HomeV2Component, canActivate: [authGuard] },
  { path: 'thumbnails', component: ThumbnailsComponent, canActivate: [authGuard] },
  { path: 'fallback', component: FallbackComponent },
  { path: 'publicview/:image_id', component: PublicviewComponent, canActivate: [authGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
