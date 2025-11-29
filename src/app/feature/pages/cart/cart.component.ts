import { Component, inject, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { CartService } from '../../../core/services/cart/cart.service';
import { isPlatformBrowser } from '@angular/common';
import { ProductService } from '../../../core/services/product service/product.service';
import { Product } from '../../../shared/interfaces/product';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrdersService } from '../../../core/services/orders.service';
import { Order } from '../../../shared/interfaces/order';
import { NotyfService } from '../../../core/services/notyf/notyf.service';


@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [ ReactiveFormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {


 cartItems = signal<Product[]>([]);
  private platformid = inject(PLATFORM_ID);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private ordersService = inject(OrdersService);
  private notyf = inject(NotyfService);

  orderForm = new FormGroup({
    customerName: new FormControl('', [Validators.required, Validators.minLength(3)]),
    phone: new FormControl('', [Validators.required, Validators.pattern(/^01[0-9]{9}$/)]),
    address: new FormControl('', [Validators.required, Validators.minLength(5)]),
  });

ngOnInit(): void {
    if (isPlatformBrowser(this.platformid)) {
      this.loadCart();
    }
}

loadCart() {
    this.cartService.getCart().subscribe(items => this.cartItems.set(items));
}

async removeItem(cartItem: Product) {
  console.log(cartItem);

  try {
    await this.cartService.removeFromCart(cartItem);
    this.notyf.error('Product deleted successfully');
    this.loadCart();

  } catch (err) {
    console.error(err);
    this.notyf.error('Error deleting product');
  }
}


updateQuantity(cartItem: Product, event: Event) {
  const newQty = Number((event.target as HTMLInputElement).value);

  if (newQty === 0) {
    this.removeItem(cartItem);
    return;
  }

  this.cartService.updateQuantity(cartItem, newQty).subscribe({
    next: () => {
      this.notyf.success('Product updated successfully');
      this.loadCart();
    },
    error: (err) => {
      this.notyf.error(err.message);
      this.loadCart(); // رجّع القيمة القديمة لو فشل
    }
  });
}


clearCart() {
    this.cartService.clearCart().subscribe(() => {
      this.notyf.error('Cart cleared successfully');
      this.loadCart();
    });
}

getTotal() {
    return this.cartItems().reduce((acc, item) => acc + item.price * item.quantity, 0);
}

submitOrder() {
    if (this.orderForm.invalid || this.cartItems().length === 0) {
      this.notyf.error('رجاءً تأكد من إدخال البيانات كاملة ووجود منتجات في الكارت.');
      return;
    }

    const newOrder: Order = {
      id: crypto.randomUUID(),
      customerName: this.orderForm.value.customerName!,
      phone: this.orderForm.value.phone!,
      address: this.orderForm.value.address!,
      items: this.cartItems(),
      totalPrice: this.getTotal(),
      date: new Date().toISOString(),
      status: 'pending',
    };

    this.ordersService.addOrder(newOrder).subscribe(() => {
      this.notyf.success('Order added successfully');
      this.cartService.clearCart().subscribe(() => this.loadCart());
      this.orderForm.reset();
    });
}

}
