import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom, forkJoin, of, throwError } from 'rxjs';
import { catchError, concatMap, switchMap, tap } from 'rxjs/operators';
import { Product } from '../../../shared/interfaces/product';
import { ProductService } from '../product service/product.service';
import { environment } from '../../../shared/envairoment/env';


@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartUrl = environment.apiUrl + '/cart_items';

  constructor(private http: HttpClient, private productService: ProductService) {}

// 🌟 جلب كل الكارت
getCart(): Observable<Product[]> {
    return this.http.get<Product[]>(this.cartUrl);
}

// 🌟 إضافة منتج للكارت وتحديث المخزون تلقائي
addToCart(product: Product, quantity: number = 1): Observable<Product> {
    return this.productService.getById(product.id).pipe(
      switchMap(stockProduct => {
        if (!stockProduct || stockProduct.quantity < quantity) {
          throw new Error('Not enough stock');
        }

        // تحديث المخزون
        const updatedProduct = { ...stockProduct, quantity: stockProduct.quantity - quantity };
        return this.productService.update(stockProduct.id, updatedProduct).pipe(
          switchMap(() => {
            // إنشاء نسخة للكارت مع الكمية المطلوبة
            const cartProduct: Product = { ...stockProduct, quantity };
            return this.http.post<Product>(this.cartUrl, cartProduct);
          })
        );
      })
    );
}

// 🌟 حذف منتج من الكارت وإرجاع الكمية للمخزون تلقائي
async removeFromCart(cartItem: Product): Promise<void> {
  try {
    // 1 حاول تجيب المنتج من المخزون
    const stockProduct = await firstValueFrom( this.productService.getById(cartItem.id));
    // 2 لو موجود → زوّد الكمية
    const updatedProduct = {...stockProduct,quantity: stockProduct.quantity + cartItem.quantity };

    await firstValueFrom( this.productService.update(stockProduct.id, updatedProduct));

    } catch (error: any) {
    // 3 لو المنتج مش موجود في المخزون → نعمله جديد
    if (error.status === 404) {
      const newProduct = { ...cartItem };
      await firstValueFrom(this.productService.add(newProduct));
    } else {
      console.error(error);
      return;
    }
    }

    // 4 في الحالتين احذف المنتج من الكارت
    await firstValueFrom(
    this.http.delete<void>(`${this.cartUrl}/${cartItem.id}`)
    );
}


// 🌟 تعديل كمية منتج في الكارت
updateQuantity(cartItem: Product, newQuantity: number): Observable<Product> {
   return this.productService.getById(cartItem.id).pipe(
  switchMap(stockProduct => {
    const diff = newQuantity - cartItem.quantity;
    if (stockProduct.quantity < diff) {
      throw new Error('Not enough stock');
    }

    const updatedQuantity = stockProduct.quantity - diff;

    // تحديث المخزون
    const updatedStock = { ...stockProduct, quantity: updatedQuantity };

    return this.productService.update(stockProduct.id, updatedStock).pipe(
      switchMap(() => {
        // لو الكمية بقت صفر بعد التحديث → امسح المنتج
        if (updatedQuantity === 0) {
          return this.productService.delete(stockProduct.id).pipe(
            switchMap(() => this.http.put<Product>(`${this.cartUrl}/${cartItem.id}`, { ...cartItem, quantity: newQuantity }))
          );
        }

        // لو الكمية أكبر من صفر → بس حدث الكارت
        return this.http.put<Product>(`${this.cartUrl}/${cartItem.id}`, { ...cartItem, quantity: newQuantity });
      })
    );
  })
);

}
  

// 🌟 مسح الكارت بالكامل وإرجاع كل الكميات للمخزون
clearCart(): Observable<void[]> {
  return this.getCart().pipe(
    switchMap(items => forkJoin(items.map(item => this.handleCartItem(item))))
  );
}
private handleCartItem(item: Product): Observable<void> {
  console.log(`Processing cart item: ${item.name} (ID: ${item.id})`);

  return this.getStockOrNull(item.id).pipe(
    concatMap(stock =>
      stock
        ? this.updateExistingStockWithLog(stock, item)
        : this.createNewStockWithLog(item)
    ),
    concatMap(() => this.deleteFromCart(item.id))
  );
}
private getStockOrNull(id: string): Observable<Product | null> {
  return this.productService.getById(id).pipe(
    tap(() => console.log(`Stock found for ID: ${id}`)),
    catchError(() => {
      console.warn(`Stock not found for ID: ${id}, creating new.`);
      return of(null);
    })
  );
}
private updateExistingStockWithLog(stock: Product, item: Product): Observable<Product> {
  const updatedStock = {
    ...stock,
    quantity: stock.quantity + item.quantity
  };

  console.log(`Updating stock: ${stock.name} from ${stock.quantity} → ${updatedStock.quantity}`);

  return this.productService.update(stock.id, updatedStock);
}
private createNewStockWithLog(item: Product): Observable<Product> {
  const newProduct: Product = {
    id: item.id,
    name: item.name,
    brand: item.brand ?? "Unknown",
    category: item.category,
    quantity: item.quantity,
    price: item.price ?? 0,
    Cost: item.Cost ?? 0,
    expiryDate: item.expiryDate,
    addedDate: item.addedDate,
    description: item.description ?? "",
    imageUrl: item.imageUrl ?? "",
    lowStockThreshold: item.lowStockThreshold ?? 1,
    isFavorite: false
  };

  console.warn(`Creating NEW stock item: ${item.name} (Qty: ${item.quantity})`);

  return this.productService.add(newProduct);
}
private deleteFromCart(id: string): Observable<void> {
  console.log(`Deleting item from cart ID: ${id}`);

  return this.http.delete<void>(`${this.cartUrl}/${id}`);
}



}
