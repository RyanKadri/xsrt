import { Component, OnInit } from '@angular/core';
import { Message, sampleMessages } from '../data/messages';

@Component({
  selector: 'app-message-view',
  templateUrl: './message-view.component.html',
  styleUrls: ['./message-view.component.scss']
})
export class MessageViewComponent implements OnInit {

  constructor() { }

  messages = sampleMessages;

  ngOnInit() {
  }

}
