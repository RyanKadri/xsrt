import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoViewComponent } from './todo-view/todo.component';

@NgModule({
  declarations: [TodoViewComponent],
  imports: [
    CommonModule
  ],
  exports: [
    TodoViewComponent
  ]
})
export class TodoModule { }
