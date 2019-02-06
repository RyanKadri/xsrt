import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeViewComponent } from './home-view/home-view.component';
import { AppRoutingModule } from '../app-routing.module';
import { MaterialModule } from '../material.module';

@NgModule({
  declarations: [HomeViewComponent],
  imports: [
    CommonModule,
    AppRoutingModule,
    MaterialModule
  ],
  exports: [
    HomeViewComponent
  ]
})
export class HomeModule { }
