import { Injectable } from '@angular/core';
import { Product } from '../../../shared/interfaces/product';


@Injectable({
  providedIn: 'root'
})
export class CartService {

   private cartKey = 'cart_items';

  constructor() { }

  // ✅ جلب كل المنتجات من الكارت
  getCartItems() {
    const items = localStorage.getItem(this.cartKey);
    return items ? JSON.parse(items) : [];
  }

  // ✅ حفظ التغييرات
  private saveCart(items: any[]) {
    localStorage.setItem(this.cartKey, JSON.stringify(items));
  }

  // ✅ إضافة منتج للكارت
  addToCart(product: Product) {
    const items = this.getCartItems();
    const existing = items.find((item: any) => item.id === product.id);
    if (existing) {
      existing.quantity += 1; // لو موجود زود الكمية
    } else {
      items.push({ ...product, quantity: 1 });
    }

    this.saveCart(items);
    console.log("cart" , product)
  }

  // ✅ تحديث الكمية
   updateQuantity(productId: string, quantity: number) {
  const items = this.getCartItems();
  const item = items.find((p: Product) => p.id === productId);
  if (!item) return;

  if (quantity <= 0) {
    this.removeFromCart(productId);
  } else {
    item.quantity = quantity;
  }
  this.saveCart(items);
   }


  // ✅ حذف منتج من الكارت
  removeFromCart(productId: string) {
    let items = this.getCartItems();
    items = items.filter((p: any) => p.id !== productId);
    this.saveCart(items);
  }

  // ✅ تفريغ الكارت بالكامل
  clearCart() {
    localStorage.removeItem(this.cartKey);
  }


}
