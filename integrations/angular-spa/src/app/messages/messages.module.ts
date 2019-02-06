import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageViewComponent } from './message-view/message-view.component';
import { MaterialModule } from '../material.module';
import { AppRoutingModule } from '../app-routing.module';
import { MessageBodyViewComponent } from './message-body-view/message-body-view.component';
import { SelectMessagePromptComponent } from './select-message-prompt/select-message-prompt.component';

@NgModule({
  declarations: [MessageViewComponent, MessageBodyViewComponent, SelectMessagePromptComponent],
  imports: [
    CommonModule,
    MaterialModule,
    AppRoutingModule
  ]
})
export class MessagesModule { }
