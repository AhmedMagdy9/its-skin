import { Product } from './../../../shared/interfaces/product';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../shared/envairoment/env';



@Injectable({
  providedIn: 'root'
})
export class ProductService {


products!:Product[]
 private baseUrl = environment.apiUrl + '/products';
categories = ["شامبو",  "بلسم",  "ليف ان",  "سيرم شعر","ماسك شعر" ,   "تريتمنت", "سبوت تريتمنت" ,   "غسول",  "غسول زيتي", "مرطب",   "صن سكرين",   "سيرم",  "ايسنس",  "تونر",  "مقشر", "كريم عين", "ماسك وجة" , "شفرات سكرين"];



  constructor(private http: HttpClient) {}

  // جلب كل المنتجات وترتيبها أبجديًا
  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl).pipe(
      map(products => products.sort((a, b) =>  a.name.localeCompare(b.name, 'default', { sensitivity: 'base' }))) );

  }


  // جلب منتج بالـ ID
  getById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  // إضافة أو تعديل منتج
  update(id: string, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, product);
  }

  add(product: Product): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, product);
  }

  delete(id: string): Observable<void> {
     console.log( 'delete',id);
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
   
  }
}



