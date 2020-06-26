import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSelectionListChange } from '@angular/material/list';

const activeTodosStorageKey = 'todos.active';
const finishedTodosStorageKey = 'todos.finished';
const lastTodoIdStorageKey = 'todos.lastId';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss']
})
export class TodoViewComponent implements OnInit {

  activeTodos: TodoItem[] = [];
  finishedTodos: TodoItem[] = [];
  lastId: number;

  newItemField = new FormControl('', [ Validators.required ]);

  ngOnInit() {
    this.activeTodos = JSON.parse(localStorage.getItem(activeTodosStorageKey)) || [];
    this.finishedTodos = JSON.parse(localStorage.getItem(finishedTodosStorageKey)) || [];
    this.lastId = parseInt(localStorage.getItem(lastTodoIdStorageKey) || '0', 10);
  }

  addTodoItem() {
    this.activeTodos.unshift({ display: this.newItemField.value, id: this.lastId ++ });
    this.newItemField.reset();
    this.save();
  }

  markFinished(change: MatSelectionListChange) {
    this.activeTodos = this.activeTodos.filter(todo => todo.id !== change.option.value.id);
    this.finishedTodos = this.finishedTodos.concat(change.option.value);
    this.save();
  }

  markInProgress(change: MatSelectionListChange) {
    this.finishedTodos = this.finishedTodos.filter(todo => todo.id !== change.option.value.id);
    this.activeTodos = this.activeTodos.concat(change.option.value);
    this.save();
  }

  deleteItem(change: TodoItem) {
    this.finishedTodos = this.finishedTodos.filter(todo => todo !== change);
    this.save();
  }

  private save() {
    this.activeTodos = this.activeTodos.sort((a, b) => b.id - a.id);
    this.finishedTodos = this.finishedTodos.sort((a, b) => b.id - a.id);
    localStorage.setItem(activeTodosStorageKey, JSON.stringify(this.activeTodos));
    localStorage.setItem(finishedTodosStorageKey, JSON.stringify(this.finishedTodos));
    localStorage.setItem(lastTodoIdStorageKey, `${this.lastId}`);
  }

}

interface TodoItem {
  display: string;
  id: number;
}
