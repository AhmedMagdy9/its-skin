import { inject, Injectable } from '@angular/core';
import { Expense } from '../../../shared/interfaces/Expenses';
import { environment } from '../../../shared/envairoment/env';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExpensesService {

  private readonly baseUrl = environment.apiUrl + '/expenses';
  private http = inject(HttpClient);

  // 🌟 جلب كل المصاريف
  getAllExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(this.baseUrl).pipe(
      map(expenses => expenses.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
    );
  }

  // 🌟 جلب المصاريف لشهر محدد
  getExpensesByMonth(month: string): Observable<Expense[]> {
    return this.getAllExpenses().pipe(
      map(expenses => expenses.filter(e => e.date.startsWith(month)))
    );
  }

  // 🌟 إضافة مصروف جديد
  addExpense(expense: Expense): Observable<Expense> {
    return this.http.post<Expense>(this.baseUrl, expense);
  }

  // 🌟 حذف مصروف
  deleteExpense(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
