import { Component, OnInit } from '@angular/core';
import { Message } from '../data/messages';
import { ActivatedRoute } from '@angular/router';
import { mergeMap, tap } from 'rxjs/operators';
import { MessageService } from '../services/message-resolver.service';
import { from } from 'rxjs';

@Component({
  selector: 'app-message-body-view',
  templateUrl: './message-body-view.component.html',
  styleUrls: ['./message-body-view.component.scss']
})
export class MessageBodyViewComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private messageResolver: MessageService
  ) { }

  selectedMessage: Message;

  ngOnInit() {
    this.activatedRoute.params.pipe(
      tap(params => { this.selectedMessage = undefined; }),
      mergeMap(params =>
        from(this.messageResolver.loadMessage(parseInt(params.messageId, 10))
      ))
    ).subscribe((message: Message) => {
      this.selectedMessage = message;
    });
  }

}
