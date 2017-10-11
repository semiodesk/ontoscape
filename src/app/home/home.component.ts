import { Component, OnInit } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { Ruleset } from '../shared';

declare var $rdf: any;
declare var SHACLValidator: any;

@Component({
  selector: 'home-page',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  constructor(
    private http: Http,
    private router: Router
  ) { }

  mimeTypes: Array<string> = [
    'application/rdf+xml',
    'application/x-turtle',
    'text/turtle',
    'text/n3',
    'text/plain'
  ];

  selectedMimeType = this.mimeTypes[0];

  rulesets: Array<Ruleset> = [
    { uri: '/assets/rulesets/default.ttl', name: 'Default' }
  ];

  selectedRuleset: string = this.rulesets[0].uri;

  sourceUrl: string = 'http://dublincore.org/2012/06/14/dcterms.ttl';
  sourceData: string = '';

  isValidating: boolean = false;
  isValidationSuccess: boolean = false;

  reportConforms: boolean = false;
  reportResults: any[];

  ngOnInit() {
  }

  downloadFile(url: string): Observable<any> {
    var headers = new Headers({
      'Accept': this.mimeTypes
    });

    console.log('Downloading file: ', url);

    return this.http.get(url, { headers: headers }).catch(this.formatErrors);
  }

  validateRuleset(data: string, rules: string) {
    var self = this;
    var validator = new SHACLValidator();

    console.info('Validating SHACL:');
    console.info(rules);

    validator.validate(data, "text/turtle", rules, "text/turtle", function (e, report) {
      self.reportConforms = report.conforms()

      console.info("Conforms: " + self.reportConforms);

      if (self.reportConforms === false) {
        var R = [];

        report.results().forEach(function (result) {
          R.push({
            severity: result.severity(),
            focusNode: result.focusNode(),
            path: result.path(),
            message: result.message()
          })
        });

        self.reportResults = R;
      }

      self.isValidating = false;
      self.isValidationSuccess = self.reportConforms;
    });
  }

  validateUrl() {
    this.isValidating = true;
    this.isValidationSuccess = false;

    if (this.sourceUrl) {
      console.info('Downloading source file: ', this.sourceUrl);

      this.downloadFile(this.sourceUrl).subscribe(
        data => {
          console.log(data);

          this.validateRuleset(data, '');
        },
        err => {
          this.isValidating = false;
          this.isValidationSuccess = false;
        }
      );
    } else {
      console.error('Invalid source file URL.', this.sourceUrl);

      this.isValidating = false;
      this.isValidationSuccess = false;
    }
  }

  validateData() {
    this.isValidating = true;
    this.isValidationSuccess = false;

    if (this.sourceData && this.sourceData !== '') {
      this.downloadFile(this.selectedRuleset).subscribe(
        data => {
          var shacl = data.text();

          this.validateRuleset(this.sourceData, shacl);

          this.isValidating = false;
          this.isValidationSuccess = true;
        },
        err => {
          console.error('Error when downloading file: ', err);

          this.isValidating = false;
          this.isValidationSuccess = false;
        }
      );
    } else {
      console.error('Invalid source data: ', this.sourceData);

      this.isValidating = false;
      this.isValidationSuccess = false;
    }
  }

  private isAbsoluteUrl(url: string) {
    var expression = /^https?:\/\//i;

    return expression.test(url);
  }

  private formatErrors(error: any) {
    return Observable.throw(error.json());
  }
}
