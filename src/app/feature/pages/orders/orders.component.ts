import { Component, inject, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { OrdersService } from '../../../core/services/orders.service';
import { Order } from '../../../shared/interfaces/order';
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { DeleteorderService } from '../../../core/services/deleteorder/deleteorder.service';
import { NotyfService } from '../../../core/services/notyf/notyf.service';
import { ProductService } from '../../../core/services/product service/product.service';
import { Product } from '../../../shared/interfaces/product';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent {
 
  allOrders: WritableSignal<Order[]> = signal<Order[]>([]);
  activeTab: 'pending' | 'completed' = 'pending';
  private platformid = inject(PLATFORM_ID);
  private deletedOrdersService = inject(DeleteorderService);
  private productService = inject(ProductService);
  private notyf = inject(NotyfService);
  private orderService = inject(OrdersService);

  ngOnInit() {
    if (isPlatformBrowser(this.platformid)) {
      this.loadOrders();
    }
  }

loadOrders() {
  this.orderService.getAllOrders().subscribe(orders => {
    this.allOrders.set(orders);
    console.log('allOrders', this.allOrders()); // هنا هتطبع البيانات صح
  });
}


  get pendingOrders() {
    return this.allOrders().filter(o => o.status === 'pending');
  }

  get completedOrders() {
    return this.allOrders().filter(o => o.status === 'completed');
  }

  markAsCompleted(order: Order) {
    this.orderService.updateOrderStatus(order.id, 'completed').subscribe(() => {
      this.notyf.success('Order marked as delivered successfully');
      this.loadOrders();
    });
  }

complated(order: Order) {
  this.deletedOrdersService.addDeletedOrder(order).subscribe(() => {
    this.orderService.deleteOrder(order.id).subscribe(() => {
      this.notyf.success('Order completed successfully');
      this.loadOrders();
    });
  });
}

  deleteOrder(order: Order) {
    const products = order.items;

    // تحديث كل منتجات المخزون عند حذف الأوردر
    const updates$ = products.map(p =>
      this.productService.getById(p.id).subscribe({
        next: stockProduct => {
          if (stockProduct) {
            // المنتج موجود في المخزون → زود الكمية
            const updated = { ...stockProduct, quantity: stockProduct.quantity + p.quantity };
            this.productService.update(stockProduct.id, updated).subscribe();
          } else {
            // المنتج مش موجود → ضيفه كمنتج جديد
            const newProduct: Product = {
              id: p.id,
              name: p.name || 'Unnamed Product',
              brand: p.brand || 'Unknown',
              category: p.category || 'Uncategorized',
              quantity: p.quantity || 0,
              price: +p.price || 0,
              Cost: +p.Cost || 0,
              expiryDate: p.expiryDate || '',
              addedDate: new Date().toISOString(),
              description: p.description || '',
              imageUrl: p.imageUrl || '',
              lowStockThreshold: p.lowStockThreshold || 0,
              isFavorite: p.isFavorite || false,
            };
            this.productService.add(newProduct).subscribe();
          }
        }
      })
    );

    // بعد تحديث كل المنتجات، احذف الأوردر
    forkJoin(updates$).subscribe(() => {
      this.orderService.deleteOrder(order.id).subscribe(() => {
        this.notyf.success('Order deleted successfully, stock updated.');
        this.loadOrders();
      });
    });
  }


}
