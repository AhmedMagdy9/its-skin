import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { Order } from '../../shared/interfaces/order';
import { environment } from '../../shared/envairoment/env';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

 private ordersUrl = environment.apiUrl + '/allOrders';

  constructor(private http: HttpClient) {}

  // 🌟 جلب كل الطلبات
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.ordersUrl);
  }

  // 🌟 أضف طلب جديد
  addOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(this.ordersUrl, order);
  }

  // 🌟 حذف طلب
  deleteOrder(id: string): Observable<void> {
    return this.http.delete<void>(`${this.ordersUrl}/${id}`);
  }

  // 🌟 تحديث طلب بالكامل
  updateOrder(updatedOrder: Order): Observable<Order> {
    return this.http.put<Order>(`${this.ordersUrl}/${updatedOrder.id}`, updatedOrder);
  }

  // 🌟 تحديث حالة الطلب فقط
  updateOrderStatus(orderId: string, newStatus: 'pending' | 'completed'): Observable<Order> {
    return this.getAllOrders().pipe(
      map(orders => orders.find(o => o.id === orderId)),
      map(order => {
        if (!order) throw new Error('Order not found');
        return { ...order, status: newStatus };
      }),
      switchMap(updated => this.updateOrder(updated))
    );
  }
}
