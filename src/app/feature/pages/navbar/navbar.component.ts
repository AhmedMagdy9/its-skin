import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NotyfService } from '../../../core/services/notyf/notyf.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink , RouterLinkActive ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
   mobileMenuOpen = false;
   selectedFileName = signal<string | null>(null);
   private notyf = inject(NotyfService)

     backupData() {
  const allData = {
  products: JSON.parse(localStorage.getItem('products') || '[]'),
  cart_items: JSON.parse(localStorage.getItem('cart_items') || '[]'),
  allOrders: JSON.parse(localStorage.getItem('allOrders') || '[]'),
  deletedOrders: JSON.parse(localStorage.getItem('deletedOrders') || '[]'),
  expenses: JSON.parse(localStorage.getItem('expenses') || '[]')
  };
  const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'its-skin-backup.json';
  a.click();

  URL.revokeObjectURL(url);
}

restoreData(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  if (!file.name.endsWith('.json')) {
    this.notyf.error('❌ الملف يجب أن يكون JSON');
    return;
  }

  this.selectedFileName.set(file.name);

  const reader = new FileReader();
  reader.onload = (e: any) => {
    try {
      const allData = JSON.parse(e.target.result);

      if (allData.products) localStorage.setItem('products', JSON.stringify(allData.products));
      if (allData.cart_items) localStorage.setItem('cart_items', JSON.stringify(allData.cart_items));
      if (allData.allOrders) localStorage.setItem('allOrders', JSON.stringify(allData.allOrders));
      if (allData.deletedOrders) localStorage.setItem('deletedOrders', JSON.stringify(allData.deletedOrders));
      if (allData.expenses) localStorage.setItem('expenses', JSON.stringify(allData.expenses));

      this.notyf.success('✅ تم استرجاع البيانات بنجاح!');
    } catch (err) {
      console.error(err);
      this.notyf.error('❌ خطأ: الملف غير صالح.');
    } finally {
      input.value = ''; // إعادة تعيين الـ input
    }
  };
  reader.readAsText(file);
}
}
