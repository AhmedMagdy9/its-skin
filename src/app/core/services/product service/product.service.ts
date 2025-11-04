import { Product } from './../../../shared/interfaces/product';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

private storageKey = 'products';
products!:Product[]
private platformid = inject(PLATFORM_ID)

constructor() {
    if (isPlatformBrowser(this.platformid)) {
    // ✅ نقرأ المنتجات من localStorage أو نبدأ بـ array فاضية
    const saved = localStorage.getItem(this.storageKey);
    this.products = saved ? JSON.parse(saved) : [];

    // ✅ تأكد دايمًا إنها Array حتى لو في مشكلة في التخزين
    if (!Array.isArray(this.products)) {
      this.products = [];
    }
      
    }
     
}

  // جلب كل المنتجات
getAll(): Product[] {
    if (isPlatformBrowser(this.platformid)) {
      const products = localStorage.getItem('products');
      return products ? JSON.parse(products) : [];
    } else {
      // لو مش في المتصفح (زي وقت الـ build)
      return [];
    }
  }
    
 
    
    


    //  حفظ المنتجات في localStorage
private saveProducts() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.products));
}

 outSaveProducts(products:Product[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(products));
}

  // اضافة منتج جديد 
add(product: Product): void {
  // أولًا نجيب كل المنتجات المخزنة حاليًا
  this.products = this.getAll();

  // نتحقق هل المنتج موجود أصلًا ولا لأ
  const existingProductIndex = this.products.findIndex(
    (p) =>
      p.name.trim().toLowerCase() === product.name.trim().toLowerCase()   
  );

  if (existingProductIndex !== -1) {
    // ✅ المنتج موجود → نزود الكمية
    const existingProduct = this.products[existingProductIndex];
    existingProduct.quantity += product.quantity;

    // لو السعر الجديد مختلف ممكن نحدثه برضو لو حبيت
    if (product.price && product.price !== existingProduct.price) {
      existingProduct.price = product.price;
    }

    // ممكن نحدث تاريخ الإضافة لو عايز تعتبرها "آخر تحديث"
    existingProduct.addedDate = new Date().toISOString();

    console.log('🔁 تم تحديث الكمية:', existingProduct);
  } else {
    // 🆕 المنتج جديد → نضيفه
    this.products.push({
      ...product,
      id: Date.now().toString(),
      addedDate: new Date().toISOString(),
    });
    console.log('✅ تمت إضافة منتج جديد:', product);
  }

  // حفظ التغييرات في localStorage
  localStorage.setItem(this.storageKey, JSON.stringify(this.products));

  console.log('📦 الحالة النهائية للمنتجات:', this.products);
}

  // حذف منتج من المخزون 
delete(id: string): void {
    const products = this.getAll().filter(p => p.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(products));
}

  // حذف جميع المنتجات
clearAll(): void {
    localStorage.removeItem(this.storageKey);
}

   //  تقليل الكمية لمنتج معين
decreaseQuantity(productId: string, amount: number = 1): void {
  const found = this.products.find((p: Product) => p.id === productId);
  if (found) {
    found.quantity = Math.max(found.quantity - amount, 0); // مننزلش عن الصفر
    this.saveProducts();
  }
}

// ✅ تزويد الكمية لما نحذف أو نقلل من الكارت
increaseQuantity(productId: string, amount: number = 1, productData?: Product): void {
  let found = this.products.find((p: Product) => p.id === productId);

  if (found) {
    // ✅ لو المنتج موجود نزود الكمية
    found.quantity += amount;
  } else if (productData) {
    // ✅ لو المنتج مش موجود نرجعه تاني بالبيانات اللي كانت في الكارت
    this.products.push({
      ...productData,
      quantity: amount
    });
  }

  this.saveProducts();
}

}
