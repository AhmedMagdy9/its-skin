import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Order } from '../../../shared/interfaces/order';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class DeleteorderService {

 private readonly deletedKey = 'deletedOrders';
 private platformid = inject(PLATFORM_ID)

 constructor() {}

    // جلب كل المنتجات
  getAllDeletedOrders(): Order[] {
      if (isPlatformBrowser(this.platformid)) {
        const products = localStorage.getItem(this.deletedKey);
        return products ? JSON.parse(products) : [];
      } else {
        // لو مش في المتصفح (زي وقت الـ build)
        return [];
      }
    }

  // ✅ أضف أوردر ممسوح
  addDeletedOrder(order: Order) {
    const deletedOrders = this.getAllDeletedOrders();
    deletedOrders.push(order);
    localStorage.setItem(this.deletedKey, JSON.stringify(deletedOrders));
  }

  // ✅ احذف أوردر ممسوح نهائيًا
  deleteDeletedOrder(orderId: string) {
    const deletedOrders = this.getAllDeletedOrders().filter(o => o.id !== orderId);
    localStorage.setItem(this.deletedKey, JSON.stringify(deletedOrders));
  }

  // ✅ امسح الكل (لو حبيت)
  clearDeletedOrders() {
    localStorage.removeItem(this.deletedKey);
  }
}
