import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _loading = new BehaviorSubject<boolean>(false);
  private callNumber = 0;
  public readonly loading$ = this._loading.asObservable();

  show() {
    if (this.callNumber === 0) {this._loading.next(true);}
    this.callNumber++;
  }

  hide() {
    if(this.callNumber > 0) {this.callNumber--;}
    if(this.callNumber === 0) {this._loading.next(false);}
  }
}