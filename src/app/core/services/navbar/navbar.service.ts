import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavbarService {
  private visible = new BehaviorSubject<boolean>(true);
  visible$ = this.visible.asObservable();

  toggle() {
    this.visible.next(!this.visible.value);
  }
}
