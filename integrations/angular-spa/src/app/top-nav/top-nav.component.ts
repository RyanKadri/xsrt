import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent implements OnInit {

  constructor() { }

  @Input()
  recording: boolean;

  @Output()
  startRecording = new EventEmitter<void>();

  @Output()
  stopRecording = new EventEmitter<void>();

  @Output()
  openSidebar = new EventEmitter<void>();

  ngOnInit() {
  }

}
