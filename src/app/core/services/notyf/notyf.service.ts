import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Notyf } from 'notyf';

@Injectable({
  providedIn: 'root'
})
export class NotyfService {

 private notyf: Notyf | null = null;
   private platformid = inject(PLATFORM_ID)

  constructor() {

    if (isPlatformBrowser(this.platformid)) {
        this.notyf = new Notyf({
        duration: 3000,
         dismissible: true ,
        position: { x: 'right', y: 'top' },
        types: [
          { type: 'success', background: '#22c55e', icon: false },
          { type: 'error', background: '#ef4444', icon: false },
          { type: 'info', background: '#3b82f6', icon: false },
        ],
      });
    }
  
  }

  success(message: string) {
    this.notyf?.success(message);
    console.log(message)
  }

  error(message: string) {
    this.notyf?.error(message);
  }

}
