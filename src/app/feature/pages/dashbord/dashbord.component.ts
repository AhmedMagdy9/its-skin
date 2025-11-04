import { Component, inject, PLATFORM_ID } from '@angular/core';
import { OrdersService } from '../../../core/services/orders.service';
import { DeleteorderService } from '../../../core/services/deleteorder/deleteorder.service';
import { ProductService } from '../../../core/services/product service/product.service';
import { CurrencyPipe, DecimalPipe, isPlatformBrowser} from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashbord',
  standalone: true,
  imports: [ DecimalPipe , CurrencyPipe, FormsModule],
  templateUrl: './dashbord.component.html',
  styleUrl: './dashbord.component.scss'
})
export class DashbordComponent {
  private platformid = inject(PLATFORM_ID)
  totalOrders = 0;
  pendingOrders = 0;
  completedOrders = 0;
  deletedOrders = 0;
  totalProducts = 0;
  totalRevenue = 0;
  filteredProfit = 0;
  filteredProfitPercentage = 0;
  topProducts: any[] = [];

  months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر' 
           ];
  years = [2025 ,2026 , 2027 , 2028 , 2029 , 2030];
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  filteredRevenue = 0;

  constructor(private orderService: OrdersService, private productService: ProductService ,private deleteorderService: DeleteorderService) {}
 

  ngOnInit() {
   if (isPlatformBrowser(this.platformid)) {
     this.loadDashboardData();
    
   }
  }

  loadDashboardData() {
    const orders = this.orderService.getAllOrders(); // كل الطلبات
    const deletedOrders = this.deleteorderService.getAllDeletedOrders(); // الطلبات المحذوفة (اللي تعتبر مكتملة فعليًا)

    this.totalOrders = orders.length;
    this.pendingOrders = orders.filter(o => o.status === 'pending').length;
    this.completedOrders = orders.filter(o => o.status === 'completed').length;
    this.deletedOrders = deletedOrders.length;

    this.totalProducts = this.productService.getAll().length;

    this.calculateRevenueAndTopProducts(deletedOrders);
  }

  calculateRevenueAndTopProducts(deletedOrders: any[]) {
    const productStats: any = {}; // لتجميع المنتجات

    deletedOrders.forEach(order => {
      order.items.forEach((item: any) => {
        if (!productStats[item.name]) {
          productStats[item.name] = {
            name: item.name,
            sold: 0,
            revenue: 0
          };
        }

        productStats[item.name].sold += item.quantity;
        productStats[item.name].revenue += item.price * item.quantity;
      });
    });

    // نحولها لمصفوفة ونرتبها
    this.topProducts = Object.values(productStats)
      .sort((a: any, b: any) => b.sold - a.sold)
      .slice(0, 5); // أول 5 منتجات

    // نحسب إجمالي الأرباح
    this.totalRevenue = this.topProducts.reduce((acc: number, p: any) => acc + p.revenue, 0);
  }

  // نسب الرسم البياني
  getPendingPercent() {
    return this.totalOrders ? (this.pendingOrders / this.totalOrders) * 100 : 0;
  }

  getCompletedPercent() {
    return this.totalOrders ? (this.completedOrders / this.totalOrders) * 100 : 0;
  }

  getDeletedPercent() {
    return this.totalOrders ? (this.deletedOrders / this.totalOrders) * 100 : 0;
  }

// ✅ دالة تحسب أرباح الشهر المحدد من الطلبات المحذوفة (بـ quantity + نسبة مئوية)
getMonthlyRevenueAndProfit(month: number | string, year: number | string): {  revenue: number;  profit: number;  profitPercentage: number; } {
  const deletedOrders = this.deleteorderService.getAllDeletedOrders();

  // 🗓️ فلترة الطلبات حسب الشهر والسنة
  const monthlyOrders = deletedOrders.filter(order => {
  const [orderYear, orderMonth] = order.date.split('-');
  return (
    Number(orderMonth) === month &&
    Number(orderYear) === year
  );
});

  console.log(deletedOrders.map(o => o.date));

  let totalRevenue = 0;
  let totalCost = 0;

  // 🧮 حساب المبيعات والتكلفة بناءً على الكمية
  monthlyOrders.forEach(order => {
    order.items?.forEach((item: any) => {
      const price = Number(item.price) || 0;
      const cost = Number(item.Cost ?? item.cost) || 0;
      const qty = Number(item.quantity) || 0;

      totalRevenue += price * qty;
      totalCost += cost * qty;
    });
  });

  const totalProfit = totalRevenue - totalCost;
  const profitPercentage =
    totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return {
    revenue: +totalRevenue.toFixed(2),
    profit: +totalProfit.toFixed(2),
    profitPercentage: +profitPercentage.toFixed(2),
  };
}


filterByMonth() {

  console.log(this.selectedMonth, this.selectedYear)
  const result = this.getMonthlyRevenueAndProfit( Number(this.selectedMonth), Number(this.selectedYear));

  this.filteredRevenue = result.revenue;
  this.filteredProfit = result.profit;
  this.filteredProfitPercentage = result.profitPercentage;
}


 // نسبة ارباح المخزون
  getProfitMarginPercent(): number {
  const products = this.productService.getAll();
  
  const totalProfit = products.reduce((sum, p: any) => {
    const price = Number(p.price) || 0;
    const cost = Number(p.Cost ?? p.cost) || 0;
    const qty = Number(p.quantity) || 0;
    return sum + (price - cost) * qty;
  }, 0);

  const totalCost = products.reduce((sum, p: any) => {
    const cost = Number(p.Cost ?? p.cost) || 0;
    const qty = Number(p.quantity) || 0;
    return sum + cost * qty;
  }, 0);

  if (totalCost === 0) return 0;
  return +(totalProfit / totalCost * 100).toFixed(2);
  }
 
  // نسبة ارباح المبيعات
  getDeletedOrdersProfitPercentage(): number {
  const deletedOrders = this.deleteorderService.getAllDeletedOrders();

  let totalCost = 0;
  let totalRevenue = 0;

  deletedOrders.forEach(order => {
    order.items?.forEach((p: any) => {
      const cost = Number(p.Cost ?? p.cost) || 0;
      const price = Number(p.price) || 0;
      const qty = Number(p.quantity) || 0;

      totalCost += cost * qty;
      totalRevenue += price * qty;
    });
  });

  const totalProfit = totalRevenue - totalCost;
  const profitPercentage = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return +profitPercentage.toFixed(2);
  }






}
