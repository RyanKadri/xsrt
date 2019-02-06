import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoViewComponent } from './todo-view/todo.component';
import { MaterialModule } from '../material.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [TodoViewComponent],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  exports: [
    TodoViewComponent
  ]
})
export class TodoModule { }
