import { Component, inject, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { OrdersService } from '../../../core/services/orders.service';
import { DeleteorderService } from '../../../core/services/deleteorder/deleteorder.service';
import { ProductService } from '../../../core/services/product service/product.service';
import { CurrencyPipe, DecimalPipe, isPlatformBrowser} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../shared/interfaces/product';
import { firstValueFrom, forkJoin } from 'rxjs';
import { Order } from '../../../shared/interfaces/order';

@Component({
  selector: 'app-dashbord',
  standalone: true,
  imports: [ DecimalPipe  , FormsModule],
  templateUrl: './dashbord.component.html',
  styleUrl: './dashbord.component.scss'
})
export class DashbordComponent {
  
   private platformid = inject(PLATFORM_ID);
  private orderService = inject(OrdersService);
  private productService = inject(ProductService);
  private deleteorderService = inject(DeleteorderService);

  totalOrders: WritableSignal<number> = signal(0);
  pendingOrders: WritableSignal<number> = signal(0);
  completedOrders: WritableSignal<number> = signal(0);
  deletedOrders: WritableSignal<number> = signal(0);
  totalProducts: WritableSignal<number> = signal(0);
  totalProductsCost: WritableSignal<number> = signal(0);
  totalProductsPrice: WritableSignal<number> = signal(0);
  totalRevenue: WritableSignal<number> = signal(0);
  ProfitPerAverage: WritableSignal<number> = signal(0);
  filteredProfit: WritableSignal<number> = signal(0);
  filteredProfitPercentage: WritableSignal<number> = signal(0); 
  filteredCost: WritableSignal<number> = signal(0);  
  filteredRevenue: WritableSignal<number> = signal(0); 
  topProducts: any[] = [];

  months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو','يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر' ];
  years = [2020, 2021 ,2022 , 2023 , 2024 ,2025 ,2026 , 2027 , 2028 , 2029 , 2030];
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();

  ngOnInit() {
    if (isPlatformBrowser(this.platformid)) {
      this.loadDashboardData();
      this.getDeletedOrdersProfitPercentage();
    }
  }

  loadDashboardData() {
    forkJoin({
      orders: this.orderService.getAllOrders(),
      deletedOrders: this.deleteorderService.getAllDeletedOrders(),
      products: this.productService.getAll()
    }).subscribe(({ orders, deletedOrders, products }) => {
      this.totalOrders.set(orders.length);
      this.pendingOrders.set(orders.filter(o => o.status === 'pending').length);
      this.completedOrders.set(orders.filter(o => o.status === 'completed').length);
      this.deletedOrders.set(deletedOrders.length);

      this.totalProducts.set(products.length);
      this.totalProductsCost.set(products.reduce((sum, p) => sum + p.Cost * p.quantity, 0));
      this.totalProductsPrice.set(products.reduce((sum, p) => sum + p.price * p.quantity, 0));

      this.calculateRevenueAndTopProducts(deletedOrders);
    });
  }

  calculateRevenueAndTopProducts(deletedOrders: Order[]) {
    const productStats: Record<string, { name: string, sold: number, revenue: number }> = {};

    deletedOrders.forEach(order => {
      order.items.forEach(item => {
        if (!productStats[item.name]) {
          productStats[item.name] = { name: item.name, sold: 0, revenue: 0 };
        }
        productStats[item.name].sold += item.quantity;
        productStats[item.name].revenue += item.price * item.quantity;
      });
    });

    this.topProducts = Object.values(productStats)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    const totalRevenue = this.topProducts.reduce((acc, p) => acc + p.revenue, 0);
    this.totalRevenue.set(totalRevenue);
  }

  getPendingPercent() {
    return this.totalOrders() ? (this.pendingOrders() / this.totalOrders()) * 100 : 0;
  }

  getCompletedPercent() {
    return this.totalOrders() ? (this.completedOrders() / this.totalOrders()) * 100 : 0;
  }

  getDeletedPercent() {
    return this.totalOrders() ? (this.deletedOrders() / this.totalOrders()) * 100 : 0;
  }


  // حساب الإيرادات والربح والمشتريات لشهر محدد
  filterByMonth() {
   forkJoin({
    deletedOrders: this.deleteorderService.getAllDeletedOrders(), // جلب كل الطلبات المحذوفة
    products: this.productService.getAll()                       // جلب كل المنتجات في المخزون
   }).subscribe(({ deletedOrders, products }) => {

    // نحسب الإيرادات، الربح، نسبة الربح، والمشتريات للشهر والسنة المحددين
    const result = this.getMonthlyRevenueAndProfit(this.selectedMonth, this.selectedYear, deletedOrders, products);

    // نحفظ النتائج في Signals للعرض في الـ HTML
    this.filteredRevenue.set(result.revenue);
    this.filteredCost.set(result.purchases);
    this.filteredProfit.set(result.profit);
    this.filteredProfitPercentage.set(result.profitPercentage);
  });
  }

  // تحسب الإيرادات، الربح، نسبة الربح، والمشتريات لشهر وسنة محددين
  getMonthlyRevenueAndProfit(month: number, year: number, deletedOrders: Order[], products: Product[]) {
  // فلترة الطلبات الشهرية
  const monthlyOrders = deletedOrders.filter(order => {
    const [orderYear, orderMonth] = order.date.split('-').map(Number);
    return orderMonth === month && orderYear === year;
  });

  // فلترة المنتجات التي تم إضافتها للمخزون في الشهر والسنة المحددين
  const monthlyProducts = products.filter(p => {
    if (!p.addedDate) return false;
    const date = new Date(p.addedDate);
    return date.getUTCMonth() + 1 === month && date.getUTCFullYear() === year;
  });

  // حساب الإيرادات والربح من الطلبات الشهرية
  const { totalRevenue, totalOrderCost } = this.calculateOrderRevenue(monthlyOrders);

  // حساب تكلفة المخزون للطلبات الشهرية
  const { totalCost } = this.calculateOrderCost(monthlyOrders);

  // حساب مشتريات المخزون الجديدة للشهر
  const totalStockPurchases = this.calculateStockPurchases(monthlyProducts);

  // حساب الربح
  const totalProfit = totalRevenue - totalOrderCost;

  // حساب نسبة الربح مع حماية من القسمة على صفر
  const profitPercentage = totalOrderCost > 0 ? (totalProfit / totalOrderCost) * 100 : 0;

  // إجمالي المشتريات = تكلفة الطلبات + مشتريات المخزون
  const totalPurchases = totalCost + totalStockPurchases;

  return {
    revenue: +totalRevenue.toFixed(2),
    profit: +totalProfit.toFixed(2),
    profitPercentage: +profitPercentage.toFixed(2),
    purchases: +totalPurchases.toFixed(2)
  };
  }

  // تحسب إجمالي الإيرادات والتكلفة للطلبات الشهرية
  calculateOrderRevenue(orders: Order[]): { totalRevenue: number; totalOrderCost: number } {
  let totalRevenue = 0;
  let totalOrderCost = 0;

  orders.forEach(order => {
    order.items?.forEach(item => {
      const price = +item.price || 0;  // سعر البيع
      const cost = +item.Cost || 0;    // سعر الشراء
      const qty = +item.quantity || 0; // الكمية
      totalRevenue += price * qty;
      totalOrderCost += cost * qty;
    });
  });

  return { totalRevenue, totalOrderCost };
  }

  // تحسب تكلفة المخزون للطلبات الشهرية
  calculateOrderCost(orders: Order[]): { totalCost: number } {
  let totalCost = 0;

  orders.forEach(order => {
    order.items?.forEach(item => {
      const itemDate = item.addedDate ? new Date(item.addedDate) : null;
      if (itemDate) {
        totalCost += (+item.Cost || 0) * (+item.quantity || 0);
      }
    });
  });

  return { totalCost };
  }

  // تحسب مشتريات المخزون الجديدة لشهر محدد
  calculateStockPurchases(products: Product[]): number {
  return products.reduce((sum, p) => sum + (+p.Cost || 0) * (+p.quantity || 0), 0);
  }



  async getDeletedOrdersProfitPercentage() {
  const deletedOrders: Order[] = await firstValueFrom(this.deleteorderService.getAllDeletedOrders());
  console.log(deletedOrders , "deletedOrders");

  let totalCost = 0;
  let totalRevenue = 0;

  deletedOrders.forEach(order => {
    order.items?.forEach(item => {
      totalCost += (item.Cost ?? 0) * (item.quantity ?? 0);
      totalRevenue += (item.price ?? 0) * (item.quantity ?? 0);
    });
  });

  const totalProfit = totalRevenue - totalCost;
  this.ProfitPerAverage.set(totalRevenue > 0 ? +(totalProfit / totalCost * 100).toFixed(2) : 0) ;
  }

}
