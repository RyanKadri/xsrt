import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-view',
  templateUrl: './home-view.component.html',
  styleUrls: ['./home-view.component.scss']
})
export class HomeViewComponent implements OnInit {

  constructor() { }

  readonly apps: HomeViewApp[] = [
    { title: 'Reminders', description: 'Manage your TODO list and set up reminders', link: ['/todos'] },
    { title: 'Messages', description: 'Check your messages', link: ['/messages'] },
  ];

  ngOnInit() {
  }

}

interface HomeViewApp {
  title: string;
  description: string;
  link: string[];
}
