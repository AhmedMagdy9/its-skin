import { Component, inject, PLATFORM_ID } from '@angular/core';
import { OrdersService } from '../../../core/services/orders.service';
import { Order } from '../../../shared/interfaces/order';
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { DeleteorderService } from '../../../core/services/deleteorder/deleteorder.service';
import { NotyfService } from '../../../core/services/notyf/notyf.service';
import { ProductService } from '../../../core/services/product service/product.service';
import { Product } from '../../../shared/interfaces/product';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent {
  allOrders: Order[] = [];
  activeTab: 'pending' | 'completed' = 'pending';
  private platformid = inject(PLATFORM_ID)
  private deletedOrdersService = inject(DeleteorderService)
  private productService = inject(ProductService)
   private notyf = inject(NotyfService)

  constructor(private orderService: OrdersService) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformid)) {
      this.loadOrders();
    }
  }

  loadOrders() {
    this.allOrders = this.orderService.getAllOrders();
  }

  get pendingOrders() {
    return this.allOrders.filter(o => o.status === 'pending');
  }

  get completedOrders() {
    return this.allOrders.filter(o => o.status === 'completed');
  }

  markAsCompleted(id: string) {
    this.orderService.updateOrderStatus(id, 'completed');
   this.notyf.success('order Delevary successfully')
    this.loadOrders();
  }

  complated(order: Order  ) {

    this.deletedOrdersService.addDeletedOrder(order);

    this.orderService.deleteOrder(order.id);
    this.notyf.success('order completed successfully')
    this.loadOrders();
  }

deleteOrder(order: Order) {
  const products = order.items;
  const allProducts: Product[] = this.productService.getAll(); // كل المنتجات الحالية في المخزون

   products.forEach((p: any) => {
    const existingProduct = allProducts.find(prod => prod.id === p.id);

    if (existingProduct) {
      // ✅ المنتج موجود: رجّع الكمية
      existingProduct.quantity += p.quantity;
    } else {
      // ✅ المنتج مش موجود: أضفه كـ Product جديد بنفس القيم
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

      allProducts.push(newProduct);
    }
  });

  // ✅ خزّن التغييرات في المخزون بعد التعديل
  this.productService.outSaveProducts(allProducts);

  // ✅ امسح الأوردر
  this.orderService.deleteOrder(order.id);

  // ✅ إشعار نجاح
  this.notyf.success('Order deleted successfully, stock updated.');

  // ✅ تحديث القائمة
  this.loadOrders();
}



}
