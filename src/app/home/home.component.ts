import { Component, ChangeDetectorRef } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Observable, Subject  } from 'rxjs/Rx';
import { Ruleset } from '../shared';

declare var SHACLValidator: any;

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(
    private http: Http,
    private router: Router,
    private detector: ChangeDetectorRef
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

  validator: any = new SHACLValidator();
  isValidating: boolean = null;
  isValidationSuccess: boolean = false;

  reportConforms: boolean = false;
  reportResults: any[];

  downloadFile(url: string, useProxy: boolean = false): Observable<any> {
    var headers = new Headers({
      'Accept': this.mimeTypes
    });

    console.log('Downloading file: ', url);

    return this.http.get(useProxy ? 'http://cors-proxy.htmldriven.com/?url=' + url : url, { headers: headers })
      .catch(this.formatErrors)
      .map(res => useProxy ? res.json() : res);
  }

  validateRuleset(data: string, rules: string) {
    console.info('Validating data:');
    console.info(data);

    console.info('Validating SHACL:');
    console.info(rules);

    // The reference to 'this' is lost when invoking the JS validate function.
    var t = this;

    this.validator.validate(data, "text/turtle", rules, "text/turtle", function(e, report) {
      t.handleValidationResult(e, report);
    });
  }

  handleValidationResult(e, report) {
    this.reportConforms = report.conforms();

    console.info("Conforms: " + this.reportConforms);

    if (this.reportConforms === false) {
      var R = [];

      report.results().forEach(function (result) {
        R.push({
          severity: result.severity(),
          focusNode: result.focusNode(),
          path: result.path(),
          message: result.message()
        })
      });

      this.reportResults = R;
    }

    this.isValidating = false;
    this.isValidationSuccess = this.reportConforms;

    // Udpate the bindings in the UI.
    this.detector.detectChanges();
  }

  validateUrl() {
    this.isValidating = true;
    this.isValidationSuccess = false;

    if (this.sourceUrl) {
      console.info('Downloading source file: ', this.sourceUrl);

      this.downloadFile(this.sourceUrl, true).subscribe(
        data => {
          console.info(data);
          
          this.sourceData = data.body;

          this.downloadFile(this.selectedRuleset).subscribe(
            data => {
              this.validateRuleset(this.sourceData, data.text());
            },
            err => {
              console.error('Error when downloading file: ', err);

              this.isValidating = false;
              this.isValidationSuccess = false;
            }
          );
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
          this.validateRuleset(this.sourceData, data.text());

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

  private formatErrors(error: any) {
    return Observable.throw(error.json());
  }
}
