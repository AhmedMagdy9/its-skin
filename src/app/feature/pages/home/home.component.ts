import { Component, effect, inject, OnDestroy, signal, ViewChild, WritableSignal, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Product } from '../../../shared/interfaces/product';
import { ProductService } from '../../../core/services/product service/product.service';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart/cart.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotyfService } from '../../../core/services/notyf/notyf.service';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { A11yModule } from "@angular/cdk/a11y";
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatFormFieldModule, MatInputModule, A11yModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnDestroy  {

  // json-server --watch db.json --port 3000


 private subscription = new Subscription()
  private cartService = inject(CartService)
  private notyf = inject(NotyfService)
  private router = inject(Router)
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
     expiryDate: new FormControl<string | null>(null),
     lowStockThreshold: new FormControl<number | null>(null),
     description: new FormControl(''),
   });

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
   dataSource = new MatTableDataSource<Product>([]);
  displayedColumns: string[] = ['name','quantity','category','expiryDate','price','Cost','settings',];

  constructor() {
    this.loadProducts();
    effect(() => {
    this.dataSource.data = this.products();
   });

   
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort; 
  }

  // تحميل المنتجات
  loadProducts(): void {
   let sub =  this.productService.getAll().subscribe((products) => {
      this.products.set(products);
      this.categories.set(this.productService.categories);
    });
    this.subscription.add(sub)
  }

  // فلترة الجدول
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // 🌟 حذف منتج
  deleteProduct(id: string): void {
   let sub =  this.productService.delete(id).subscribe(() => {
      this.notyf.error('Product Deleted successfully');
      this.loadProducts();
    });
    this.subscription.add(sub)
  }

  // 🌟 إضافة منتج للكارت وتحديث المخزون تلقائي
  addToCart(product: Product): void {
   let sub =  this.cartService.addToCart(product, 1).subscribe({
      next: () => {
        this.notyf.success('Product added successfully');
        this.loadProducts(); // تحديث الكمية بعد الإضافة
        const targetProduct = this.products().filter(p => p.id === product.id)[0];
        targetProduct.quantity -= 1;
        if (targetProduct.quantity === 0) {
          this.deleteProduct(product.id);
        }
      },
      error: (err) => {
        this.notyf.error(err.message);
      }
    });
    this.subscription.add(sub)
  }

  // 🌟 لون الصلاحية
  getExpiryColor(expiryDate: string): string {
    const today = new Date();
    if (expiryDate.includes('-')) {
      const [year, month, day] = expiryDate.split('-');
      expiryDate = `${year}-${month}-${day}`;
    }
    const expiry = new Date(expiryDate);
    const diffInDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays < 0) return 'text-red-600';
    else if (diffInDays <= 60) return 'text-yellow-600';
    else return 'text-green-600';
  }

  // 🌟 بدء التعديل
  startEdit(product: Product) {
    this.editingProductId.set(product.id);
    this.editForm.patchValue(product);
  }

  // 🌟 حفظ التعديلات
  saveEdit() {
    const editingId = this.editingProductId();
    if (!editingId) return; 
    const updatedData = this.editForm.value as Product;
  let sub =   this.productService.update(editingId, updatedData).subscribe(() => {
      this.notyf.success('Product updated successfully');
      this.editingProductId.set(null);
      this.editForm.reset();
      this.loadProducts();
    });
    this.subscription.add(sub)
  }

  // 🌟 إلغاء التعديل
  cancelEdit() {
    this.editingProductId.set(null);
    this.editForm.reset();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
