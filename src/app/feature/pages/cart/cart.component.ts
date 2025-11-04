import { Component, inject, PLATFORM_ID } from '@angular/core';
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

cartItems: any[] = [];
private platformid = inject(PLATFORM_ID)
private productService = inject(ProductService)
private cartService = inject(CartService)
private ordersService = inject(OrdersService)
private notyf = inject(NotyfService)
orderForm = new FormGroup({
 customerName: new FormControl('', [Validators.required, Validators.minLength(3)]),
 phone: new FormControl('', [ Validators.required, Validators.pattern(/^01[0-9]{9}$/)]),
 address: new FormControl('', [Validators.required, Validators.minLength(5)]),
});


ngOnInit(): void {
    if (isPlatformBrowser(this.platformid)) {
      this.loadCart();
     
    }
}

loadCart() {
    this.cartItems = this.cartService.getCartItems();
}

removeItem(id: string) {
  // 🧩 1. هات المنتج من الكارت قبل ما تمسحه
  const item = this.cartService.getCartItems().find((p: any) => p.id === id);

  if (!item) return; // safety check

  // 🧩 2. احذف المنتج من الكارت
  this.cartService.removeFromCart(id);

  // 🧩 3. زوّد الكمية أو رجّع المنتج للـ products لو كان اتمسح
  this.productService.increaseQuantity(id, item.quantity, item);

  this.notyf.error('product Deleted successfully')

  // 🧩 4. حدّث الكارت بعد التغيير
  this.loadCart();
}

// UPDATE
////////////////////////////////////////////////// 
updateQuantity(id: string, event: any) {
  const newQty = +event.target.value;
  const item = this.cartService.getCartItems().find((p: Product) => p.id === id);
  if (!item) return;

  const diff = newQty - item.quantity;

  if (diff > 0) {
    // 🧠 رجّع true/false من handleIncreaseQuantity
    const increased = this.handleIncreaseQuantity(id, diff, event, item);
    if (!increased) return; // ⛔ لو التزويد فشل، ما تحدّثش الكارت
  } else if (diff < 0) {
    this.handleDecreaseQuantity(id, diff, item);
  }

  this.cartService.updateQuantity(id, newQty);
  this.notyf.success('✅ Product updated successfully');
  this.loadCart();
}



// 🔹 لما المستخدم يدخل 0
handleZeroQuantity(id: string, newQty: number): boolean {
  if (newQty === 0) {
    this.removeItem(id);
    this.loadCart();
    return true;
  }
  return false;
}


// 🔹 لما المستخدم يزود الكمية
handleIncreaseQuantity(id: string, diff: number, event: any, item: Product): boolean {
  const productInStock = this.productService.getAll().find((p: Product) => p.id === id);

  // 🔒 لو المنتج مش موجود في المخزون → ممنوع التزويد
  if (!productInStock) {
    this.notyf.error('❌ المنتج غير متوفر في المخزون');
    event.target.value = item.quantity; // رجّع القيمة القديمة
    return false; // ❌ فشل التزويد
  }

  // 🔒 لو المخزون أقل من المطلوب
  if (productInStock.quantity < diff) {
    this.notyf.error('❌ الكمية المطلوبة غير متوفرة في المخزون');
    event.target.value = item.quantity; // رجّع القيمة القديمة
    return false; // ❌ فشل التزويد
  }

  // ✅ لو تمام، قلل من المخزون
  this.productService.decreaseQuantity(id, diff);

  // ✅ لو الكمية وصلت صفر امسح المنتج من المخزون
  const updatedProduct = this.productService.getAll().find((p: Product) => p.id === id);
  if (updatedProduct && updatedProduct.quantity === 0) {
    this.productService.delete(id);
  }

  return true; // ✅ تم التزويد بنجاح
}




// 🔹 لما المستخدم يقلل الكمية
handleDecreaseQuantity(id: string, diff: number, item: Product): void {
  const amountToReturn = Math.abs(diff);

  // 🔍 جِب المنتج من المخزون (لو مش موجود، رجّعه)
  let productInStock = this.productService.getAll().find((p: Product) => p.id === id);

  if (productInStock) {
    // ✅ لو موجود، زوّد الكمية
    this.productService.increaseQuantity(id, amountToReturn);
  } else {
    // ✅ لو مش موجود، رجّعه تاني بالبيانات اللي كانت في الكارت
    this.productService.increaseQuantity(id, amountToReturn, item);
  }

  // 🧠 مش محتاج نحذف هنا، لأننا بنزوّد مش بنقلل
}



// 🔹 التحقق من الكمية المتاحة في المخزون
validateStock(productInStock: Product, diff: number, event: any, item: Product): boolean {
  if (productInStock.quantity < diff) {
    alert('الكمية المطلوبة غير متوفرة في المخزون.');
    event.target.value = item.quantity;
    return false;
  }
  return true;
}
//////////////////////////////////////////////////

clearCart() {
  // ✅ 1. هات كل المنتجات اللي في الكارت
  const cartItems = this.cartService.getCartItems();

  // ✅ 2. رجّع الكمية لكل منتج في المخزون
  cartItems.forEach((item: Product) => {
    const productInStock = this.productService.getAll().find((p: Product) => p.id === item.id);

    if (productInStock) {
      // لو المنتج موجود في المخزون → رجعله الكمية
      this.productService.increaseQuantity(item.id, item.quantity, item);
    } else {
      // لو المنتج كان اتحذف من المخزون → أضفه من جديد بالكمية اللي كانت في الكارت
      const restoredProduct = { ...item, quantity: item.quantity };
      this.productService.add(restoredProduct);
    }
  });

  // ✅ 3. امسح الكارت بعد استرجاع الكميات
  this.cartService.clearCart();
  this.notyf.error('cart Deleted successfully')
  this.loadCart();

}


getTotal() {
    return this.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
}

  submitOrder() {
    if (this.orderForm.invalid || this.cartItems.length === 0) {
      alert('رجاءً تأكد من إدخال البيانات كاملة ووجود منتجات في الكارت.');
      return;
    }

    const newOrder: Order = {
      id: crypto.randomUUID(),
      customerName: this.orderForm.value.customerName!,
      phone: this.orderForm.value.phone!,
      address: this.orderForm.value.address!,
      items: this.cartItems,
      totalPrice: this.getTotal(),
      date: new Date().toISOString(),
      status: 'pending',
    };

    // ✅ أضف الطلب
    this.ordersService.addOrder(newOrder);
    console.log(newOrder)

    // ✅ امسح الكارت
    this.cartService.clearCart();
    this.notyf.success('order added successfully')
    this.loadCart()
    this.orderForm.reset();
   
  }

}
