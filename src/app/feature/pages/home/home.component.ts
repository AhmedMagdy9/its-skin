import { Component, inject, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { Product } from '../../../shared/interfaces/product';
import { ProductService } from '../../../core/services/product service/product.service';
import { isPlatformBrowser } from '@angular/common';
import { CartService } from '../../../core/services/cart/cart.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotyfService } from '../../../core/services/notyf/notyf.service';
import { ExpensesComponent } from "../expenses/expenses.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  private platformid = inject(PLATFORM_ID)
  private cartService = inject(CartService)
  private notyf = inject(NotyfService)
  private productService = inject(ProductService)
  products:WritableSignal<Product[]> = signal<Product[]>([]);
  categories:WritableSignal<string[]> = signal <string[]>([])
  searchTerm:WritableSignal<string> = signal('');
  editingProductId:WritableSignal<string | null> = signal(null);
  editForm: FormGroup = new FormGroup({
     name: new FormControl('', Validators.required),
     brand: new FormControl('', Validators.required),
     category: new FormControl('', Validators.required),
     quantity: new FormControl(0, [Validators.required, Validators.min(1)]),
     price: new FormControl<number | null>(null, [Validators.min(1)]),
     Cost: new FormControl<number | null>(null, [Validators.min(1)]),
     lowStockThreshold: new FormControl<number | null>(null),
     description: new FormControl(''),
   });

  ngOnInit(): void {
   if (isPlatformBrowser(this.platformid)) {
     this.loadProducts();
     this.categories.set(this.productService.categories)
   }
  }

  loadProducts(): void {
    this.products.set(this.productService.getAll()) ;
    console.log( this.products())
   
  }

 deleteProduct(id: string): void {
    this.productService.delete(id);
    this.loadProducts();
    this.notyf.error('Product Deleted successfully')
  }

 getExpiryColor(expiryDate: string): string {
  const today = new Date();
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

  // بدء التعديل على منتج معين
  startEdit(product: Product) {
    this.editingProductId.set(product.id); 
    this.editForm.patchValue(product);
  }

  // حفظ التعديلات
  saveEdit() {
    if (!this.editingProductId) return;
    console.log(this.editForm.value)
    const index = this.products().findIndex(p => p.id === this.editingProductId());
    if (index !== -1) {
      this.products()[index] = { ...this.products()[index], ...this.editForm.value };
      this.productService.outSaveProducts(this.products());
      this.editingProductId.set(null);
      this.editForm.reset();
      this.loadProducts();
      this.notyf.success('Product updated successfully')
    }
  }

  // إلغاء التعديل
  cancelEdit() {
    this.editingProductId.set(null);
    this.editForm.reset();
  }

}
