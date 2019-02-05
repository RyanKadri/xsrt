import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeViewComponent } from './home-view/home-view.component';

@NgModule({
  declarations: [HomeViewComponent],
  imports: [
    CommonModule
  ],
  exports: [
    HomeViewComponent
  ]
})
export class HomeModule { }
