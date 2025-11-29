import { inject, Injectable } from '@angular/core';
import { Order } from '../../../shared/interfaces/order';
import { environment } from '../../../shared/envairoment/env';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeleteorderService {

  private readonly deletedUrl = environment.apiUrl + '/deletedOrders';
  private http = inject(HttpClient);

  // 🌟 جلب كل الأوردرات المحذوفة
  getAllDeletedOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.deletedUrl);
  }

  // 🌟 أضف أوردر محذوف
  addDeletedOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(this.deletedUrl, order);
  }

  // 🌟 احذف أوردر  نهائيًا
  deleteDeletedOrder(orderId: string): Observable<void> {
    return this.http.delete<void>(`${this.deletedUrl}/${orderId}`);
  }

  // 🌟 مسح كل الأوردرات المحذوفة (اختياري)
  clearDeletedOrders(): Observable<void[]> {
    return this.getAllDeletedOrders().pipe(
      switchMap(deletedOrders => {
        const deletes = deletedOrders.map(order => this.deleteDeletedOrder(order.id));
        return forkJoin(deletes);
      })
    );
  }

}
