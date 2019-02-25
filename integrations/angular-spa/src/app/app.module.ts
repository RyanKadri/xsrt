import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeModule } from './home/home.module';
import { MaterialModule } from './material.module';
import { MessagesModule } from './messages/messages.module';
import { TodoModule } from './todo/todo.module';
import { TopNavComponent } from './top-nav/top-nav.component';

@NgModule({
  declarations: [
    AppComponent,
    TopNavComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MaterialModule,
    TodoModule,
    HomeModule,
    MessagesModule,
    ReactiveFormsModule
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
