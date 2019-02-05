import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TodoViewComponent } from './todo/todo-view/todo.component';
import { HomeViewComponent } from './home/home-view/home-view.component';

const routes: Routes = [
  { path: 'todos', component: TodoViewComponent },
  { path: 'home', component: HomeViewComponent },
  { path: '', pathMatch: 'full', redirectTo: 'home'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
