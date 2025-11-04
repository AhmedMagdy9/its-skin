import { Component, inject, PLATFORM_ID } from '@angular/core';
import { Product } from '../../../shared/interfaces/product';
import { ProductService } from '../../../core/services/product service/product.service';
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filtercategory',
  standalone: true,
  imports: [CommonModule, CurrencyPipe , FormsModule],
  templateUrl: './filtercategory.component.html',
  styleUrl: './filtercategory.component.scss'
})
export class FiltercategoryComponent {

  categories: string[] = [];
  selectedCategory = '';
  filteredProducts: Product[] = [];
  private platformid = inject(PLATFORM_ID)

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
   if (isPlatformBrowser(this.platformid)) {
     // ✅ استرجاع الفئات من كل المنتجات (بدون تكرار)
    const allProducts = this.productService.getAll();
    this.categories = [...new Set(allProducts.map(p => p.category))];
    
   }
  }

  filterProducts(): void {
    const allProducts = this.productService.getAll();
    this.filteredProducts = allProducts.filter(
      p => p.category === this.selectedCategory
    );
  }

}
