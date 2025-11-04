import { Component, inject, PLATFORM_ID } from '@angular/core';
import { Product } from '../../../shared/interfaces/product';
import { ProductService } from '../../../core/services/product service/product.service';
import { isPlatformBrowser } from '@angular/common';
import { CartService } from '../../../core/services/cart/cart.service';
import { FormsModule } from '@angular/forms';
import { NotyfService } from '../../../core/services/notyf/notyf.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  private platformid = inject(PLATFORM_ID)
  private cartService = inject(CartService)
  private notyf = inject(NotyfService)
  products: Product[] = [];
  searchTerm: string = '';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
   if (isPlatformBrowser(this.platformid)) {
     this.loadProducts();
   }
  }

  loadProducts(): void {
    this.products = this.productService.getAll();
  }

 deleteProduct(id: string): void {
    this.productService.delete(id);
    this.loadProducts();
    this.notyf.error('Product Deleted successfully')
  }

getExpiryColor(expiryDate: string): string {
  const today = new Date();
  // console.log( 'قبل' ,expiryDate)

  // لو التاريخ بالشكل dd/mm/yyyy نحوله ل yyyy-mm-dd
  if (expiryDate.includes('-')) {
    const [day, month, year] = expiryDate.split('-');
    expiryDate = `${year}-${month}-${day}`;
    // console.log('بعد' ,expiryDate)
  }

  const expiry = new Date(expiryDate);
  const diffInTime = expiry.getTime() - today.getTime();
  const diffInDays = Math.ceil(diffInTime / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) return 'text-red-600'; // منتهي
  else if (diffInDays <= 60) return 'text-yellow-600'; // باقي أقل من شهرين
  else return 'text-green-600'; // سليم
}

addToCart(product: any) {
  // ✅ 1. أضف المنتج للكارت
  this.cartService.addToCart(product);

  // ✅ 2. قلل الكمية في السيرفس
  this.productService.decreaseQuantity(product.id);

  // ✅ 3. هات النسخة الجديدة من المنتج بعد التحديث
  const updatedProduct = this.productService.getAll().find((p: any) => p.id === product.id);

  // ✅ 4. لو الكمية وصلت صفر احذفه
  if (updatedProduct && updatedProduct.quantity === 0) {
    this.deleteProduct(product.id);
  }

  this.notyf.success('Product added successfully')
  // ✅ 5. حدث الليستة في الصفحة
  this.loadProducts();

 
}

}
