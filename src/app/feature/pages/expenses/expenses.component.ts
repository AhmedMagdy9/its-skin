import { Component, inject, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpensesService } from '../../../core/services/Expenses/expenses.service';
import { Expense } from '../../../shared/interfaces/Expenses';
import { isPlatformBrowser } from '@angular/common';
import { NotyfService } from '../../../core/services/notyf/notyf.service';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [ReactiveFormsModule ],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss'
})
export class ExpensesComponent {

filteredExpenses: WritableSignal<Expense[]> = signal<Expense[]>([]);
private platformid = inject(PLATFORM_ID)
private notyfService = inject(NotyfService)

expenseForm: FormGroup = new FormGroup({
  title: new FormControl('', Validators.required),
  amount: new FormControl('', [Validators.required, Validators.min(1)]),
  date: new FormControl('', Validators.required),
  details: new FormControl('')
});

constructor(private expensesService: ExpensesService) {}

ngOnInit(): void {
  if (isPlatformBrowser(this.platformid)) {
    this.loadExpenses();
  }
}

// 🌟 تحميل كل المصاريف
loadExpenses(): void {
  this.expensesService.getAllExpenses().subscribe({
    next: (res) => this.filteredExpenses.set(res),
    error: (err) => console.error(err)
  });
}

// 🌟 إضافة مصروف
onAddExpense(): void {
  if (this.expenseForm.valid) {
    const newExpense: Expense = {
      ...this.expenseForm.value,
      id: Date.now().toString()
    };

    this.expensesService.addExpense(newExpense).subscribe({
      next: (res) => {
        this.notyfService.success('Expense added successfully.');
        this.loadExpenses();
        this.expenseForm.reset();
      },
      error: (err) => console.error(err)
    });
  }
}

// 🌟 فلترة حسب الشهر
filterByMonth(event: any): void {
  const month = event.target.value; // مثال: "2025-11"
  this.expensesService.getExpensesByMonth(month).subscribe({
    next: (res) => this.filteredExpenses.set(res),
    error: (err) => console.error(err)
  });
}

// 🌟 حذف مصروف
deleteExpense(id: string): void {
  this.expensesService.deleteExpense(id).subscribe({
    next: () => {
      this.notyfService.error('Expense deleted successfully.');
      this.loadExpenses();
    },
    error: (err) => console.error(err)
  });
}

  
}
