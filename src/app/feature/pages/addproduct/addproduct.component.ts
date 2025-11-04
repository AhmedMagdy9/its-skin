import { Component, inject } from '@angular/core';
import { ProductService } from '../../../core/services/product service/product.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../../../shared/interfaces/product';
import { NotyfService } from '../../../core/services/notyf/notyf.service';

@Component({
  selector: 'app-addproduct',
  standalone: true,
  imports: [ ReactiveFormsModule],
  templateUrl: './addproduct.component.html',
  styleUrl: './addproduct.component.scss'
})
export class AddproductComponent {

   private productService = inject(ProductService)
   private notyf = inject(NotyfService)

 
  productForm = new FormGroup({
    id: new FormControl(''), // هيتولد أوتوماتيك لما نضيف المنتج
    name: new FormControl('', Validators.required),
    brand: new FormControl('', Validators.required),
    category: new FormControl('', Validators.required),
    quantity: new FormControl(0, [Validators.required, Validators.min(1)]),
    price: new FormControl<number | null>(null, [Validators.min(0)]),
    Cost: new FormControl<number | null>(null, [Validators.min(0)]),
    expiryDate: new FormControl<string | null>(null),
    addedDate: new FormControl(new Date().toISOString()), // بيتسجل تلقائيًا
    description: new FormControl(''),
    lowStockThreshold: new FormControl<number | null>(null),
    isFavorite: new FormControl(false)
  });

  constructor() {}

  onSubmit(): void {
    if (this.productForm.valid) {
      const newProduct: Product = this.productForm.value as Product;
      newProduct.id = Date.now().toString(); // أو UUID بعدين
      newProduct.addedDate = new Date().toISOString();
      this.notyf.success('Product added successfully')
      // بعدين نحفظه في localStorage أو نضيفه للـ service
      this.productService.add(newProduct)
    } else {
      this.notyf.error('⚠️ Form is invalid')
    }
  }

}
