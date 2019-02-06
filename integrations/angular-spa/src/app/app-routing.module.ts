import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TodoViewComponent } from './todo/todo-view/todo.component';
import { HomeViewComponent } from './home/home-view/home-view.component';
import { MessageViewComponent } from './messages/message-view/message-view.component';
import { MessageBodyViewComponent } from './messages/message-body-view/message-body-view.component';
import { SelectMessagePromptComponent } from './messages/select-message-prompt/select-message-prompt.component';

const routes: Routes = [
  { path: 'todos', component: TodoViewComponent },
  { path: 'home', component: HomeViewComponent },
  { path: 'messages', component: MessageViewComponent, children: [
    { path: '', pathMatch: 'full', component: SelectMessagePromptComponent },
    { path: ':messageId', component: MessageBodyViewComponent },
  ]},
  { path: '', pathMatch: 'full', redirectTo: 'home'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
