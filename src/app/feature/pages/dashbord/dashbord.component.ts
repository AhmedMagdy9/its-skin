import { Component, inject, PLATFORM_ID } from '@angular/core';
import { OrdersService } from '../../../core/services/orders.service';
import { DeleteorderService } from '../../../core/services/deleteorder/deleteorder.service';
import { ProductService } from '../../../core/services/product service/product.service';
import { CurrencyPipe, DecimalPipe, isPlatformBrowser} from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashbord',
  standalone: true,
  imports: [ DecimalPipe , CurrencyPipe , FormsModule],
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
  totalProductsCost = 0;
  totalProductsPrice = 0;
  totalRevenue = 0;
  filteredProfit = 0;
  filteredProfitPercentage = 0;
  filteredCost: number = 0;    
  topProducts: any[] = [];
  // filteredProducts: any[] = [];

  months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر' 
           ];
  years = [2020, 2021 ,2022 , 2023 , 2024 ,2025 ,2026 , 2027 , 2028 , 2029 , 2030];
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
    this.totalProductsCost = this.productService.getAll().reduce((sum, p) => sum + Number(p.Cost * p.quantity || 0), 0);
    this.totalProductsPrice = this.productService.getAll().reduce((sum, p) => sum + Number(p.price * p.quantity || 0), 0);

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

// ✅ دالة تحسب أرباح الشهر المحدد من الطلبات المكتملة 
getMonthlyRevenueAndProfit(month: number | string, year: number | string): {
  revenue: number;
  profit: number;
  profitPercentage: number;
  purchases: number; // ✅ مضافة هنا لوحدها
} {
  const deletedOrders = this.deleteorderService.getAllDeletedOrders();
  const allProducts = this.productService.getAll();

  // 🗓️ فلترة الطلبات حسب الشهر والسنة
  const monthlyOrders = deletedOrders.filter(order => {
    const [orderYear, orderMonth] = order.date.split('-');
    return Number(orderMonth) === month && Number(orderYear) === year;
  });

  let totalRevenue = 0;
  let totalOrderCost = 0;
  let totalStockPurchases = 0;

  // 💰 حساب المبيعات والتكلفة من الطلبات
  monthlyOrders.forEach(order => {
    order.items?.forEach((item: any) => {
      const price = Number(item.price) || 0;
      const cost = Number(item.Cost ?? item.cost) || 0;
      const qty = Number(item.quantity) || 0;

      totalRevenue += price * qty;
      totalOrderCost += cost * qty;
    });
  });

  // 🏪 حساب المشتريات من المنتجات الجديدة في الشهر
const monthlyProducts = allProducts.filter((p: any) => {
  if (!p.addedDate) return false;

  const date = new Date(p.addedDate);
  if (isNaN(date.getTime())) return false; // لو التاريخ مش صالح

  const productMonth = date.getUTCMonth() + 1; // ✅ استخدم UTCMonth عشان الـ "Z"
  const productYear = date.getUTCFullYear();
  return productMonth === Number(month) && productYear === Number(year);
});



  monthlyProducts.forEach((p: any) => {
    const productCost = Number(p.Cost) || 0;
    const productQty = Number(p.quantity) || 0;
    totalStockPurchases += productCost * productQty;
  });
  console.log( 'totalStockPurchases', totalStockPurchases)

  // 💹 هنا هنحسب الربح بناءً على الطلبات فقط (من غير المشتريات)
  const totalProfit = totalRevenue - totalOrderCost;
  const profitPercentage = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return {
    revenue: +totalRevenue.toFixed(2),
    profit: +totalProfit.toFixed(2),
    profitPercentage: +profitPercentage.toFixed(2),
    purchases: +totalStockPurchases.toFixed(2) // ✅ رقم منفصل
  };
}



 filterByMonth() {
  // console.log(this.selectedMonth, this.selectedYear);

  const result = this.getMonthlyRevenueAndProfit(
    Number(this.selectedMonth),
    Number(this.selectedYear)
  );

  this.filteredRevenue = result.revenue;
  this.filteredCost = result.purchases;
  this.filteredProfit = result.profit;
  this.filteredProfitPercentage = result.profitPercentage;
}

// filterByMonthT(): void {
//   const allProducts = this.productService.getAll();

//   this.filteredProducts = allProducts.filter(p => {
//     const date = new Date(p.addedDate);
//     const productMonth = (date.getMonth() + 1).toString().padStart(2, '0');
//     const productYear = date.getFullYear().toString();

//     return (
//       (this.selectedMonth ? productMonth === this.selectedMonth : true) &&
//       (this.selectedYear ? productYear === this.selectedYear : true)
//     );
//   });
// }

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
