import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'home-page',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  constructor(
    private router: Router
  ) { }

  sourceUrl : String = 'http://dublincore.org/2012/06/14/dcterms.ttl';

  ngOnInit() {
    console.info('home.component.ts: ngOnInit');
  }
}
