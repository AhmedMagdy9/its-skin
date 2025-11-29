import { Component, inject, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { Product } from '../../../shared/interfaces/product';
import { ProductService } from '../../../core/services/product service/product.service';
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotyfService } from '../../../core/services/notyf/notyf.service';
import { CartService } from '../../../core/services/cart/cart.service';

@Component({
  selector: 'app-filtercategory',
  standalone: true,
  imports: [CommonModule, CurrencyPipe , FormsModule],
  templateUrl: './filtercategory.component.html',
  styleUrl: './filtercategory.component.scss'
})
export class FiltercategoryComponent {

  categories: WritableSignal<string[]> = signal([]);
brands: WritableSignal<string[]> = signal([]);
selectedCatOrBrand: WritableSignal<string> = signal('');
filteredProducts: WritableSignal<Product[]> = signal([]);
private platformid = inject(PLATFORM_ID)
private cartService = inject(CartService);
private notyf = inject(NotyfService)

constructor(private productService: ProductService) {}

ngOnInit(): void {
  if (isPlatformBrowser(this.platformid)) {
    this.loadCategoriesAndBrands();
  }
}

loadCategoriesAndBrands() {
  this.productService.getAll().subscribe({
    next: (products) => {
      this.categories.set([...new Set(products.map(p => p.category))]);
      this.brands.set([...new Set(products.map(p => p.brand))]);
    },
    error: (err) => console.error(err)
  });
}

filterProducts(filterWord: string): void {
  this.productService.getAll().subscribe({
    next: (products) => {
      this.filteredProducts.set(
        products.filter(p => p.category === filterWord || p.brand === filterWord)
      );
    },
    error: (err) => console.error(err)
  });
}

addToCart(product: Product): void {
    this.cartService.addToCart(product, 1).subscribe({
      next: () => {
        this.notyf.success('Product added successfully');
        const targetProduct = this.filteredProducts().filter(p => p.id === product.id)[0];
        targetProduct.quantity -= 1;
        if (targetProduct.quantity === 0) {
          this.productService.delete(product.id).subscribe();
        }
      },
      error: (err) => {
        this.notyf.error(err.message);
      }
    });
}

}
