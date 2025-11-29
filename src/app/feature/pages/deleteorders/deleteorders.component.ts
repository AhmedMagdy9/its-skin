import { Component, inject, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { Order } from '../../../shared/interfaces/order';
import { DeleteorderService } from '../../../core/services/deleteorder/deleteorder.service';
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { NotyfService } from '../../../core/services/notyf/notyf.service';

@Component({
  selector: 'app-deleteorders',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './deleteorders.component.html',
  styleUrl: './deleteorders.component.scss'
})
export class DeleteordersComponent {


  deletedOrders: WritableSignal<Order[]> = signal<Order[]>([]);
  private platformid = inject(PLATFORM_ID);
  private notyf = inject(NotyfService);
  private deletedOrdersService = inject(DeleteorderService);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformid)) {
      this.loadDeletedOrders();
    }
  }
loadDeletedOrders() {
  this.deletedOrdersService.getAllDeletedOrders().subscribe({
    next: (orders) => {
      this.deletedOrders.set(orders);
      console.log('deletedOrders', this.deletedOrders());
    },
    error: (err) => this.notyf.error('Failed to load deleted orders')
  });
}


  deletePermanently(orderId: string) {
    if (!confirm('Are you sure you want to delete this order permanently?')) return;

    this.deletedOrdersService.deleteDeletedOrder(orderId).subscribe({
      next: () => {
        this.notyf.success('Order deleted successfully');
        this.loadDeletedOrders(); // حدث القائمة بعد الحذف
      },
      error: (err) => this.notyf.error('Failed to delete order')
    });
  }

}
