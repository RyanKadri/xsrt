import { Injectable } from '@angular/core';
import { Message, sampleMessages } from '../data/messages';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor() { }

  loadMessage(messageId: number): Promise<Message> {
    return new Promise<Message>((resolve, reject) => {
      setTimeout(() =>
        resolve(sampleMessages.find(message => message.id === messageId ))
      , 1000);
    });
  }
}
