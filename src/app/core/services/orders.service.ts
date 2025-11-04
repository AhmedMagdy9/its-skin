import { Injectable } from '@angular/core';
import { Order } from '../../shared/interfaces/order';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

 private ordersKey = 'allOrders';


  // ✅ رجّع كل الطلبات
  getAllOrders(): Order[] {
    return JSON.parse(localStorage.getItem(this.ordersKey) || '[]');
  }

  // ✅ أضف طلب جديد
  addOrder(order: Order) {
    const orders = this.getAllOrders();
    orders.push(order);
    localStorage.setItem(this.ordersKey, JSON.stringify(orders));
  }

  // ✅ امسح طلب
  deleteOrder(id: string) {
    const updated = this.getAllOrders().filter(o => o.id !== id);
    localStorage.setItem(this.ordersKey, JSON.stringify(updated));
  }

  // ✅ حدّث طلب (لو هتضيف الحالة مثلاً)
  updateOrder(updatedOrder: Order) {
    const orders = this.getAllOrders().map(o => o.id === updatedOrder.id ? updatedOrder : o);
    localStorage.setItem(this.ordersKey, JSON.stringify(orders));
  }

  // ✅ تحديث الحالة فقط (لو حبيت تستخدمها في المستقبل)
  updateOrderStatus(orderId: string, newStatus: 'pending' | 'completed') {
    const orders = this.getAllOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      orders[orderIndex].status = newStatus;
      localStorage.setItem(this.ordersKey, JSON.stringify(orders));
    }
  }
}
