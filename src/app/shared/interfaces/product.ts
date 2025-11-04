// src/app/core/models/product.model.ts
export interface Product {
  id: string;                  // ID فريد (UUID أو timestamp)
  name: string;                // اسم المنتج (مثلاً: كريم ترطيب، تونر)
  brand: string;               // الماركة (The Ordinary, CeraVe, Nivea...)
  category: string;            // الفئة (مرطب، سيروم، غسول، واقي شمس...)
  quantity: number;            // الكمية المتاحة
  price: number;              // السعر (اختياري)
  Cost: number;              //    سعر الشراء(اختياري)
  expiryDate?: string;         // تاريخ الصلاحية (مهم في منتجات التجميل)
  addedDate: string;           // تاريخ إضافة المنتج في النظام
  description?: string;        // وصف مختصر أو ملاحظات (مثلاً: "يناسب البشرة الحساسة")
  imageUrl?: string;           // صورة المنتج (base64 أو path)
  lowStockThreshold?: number;  // الحد الأدنى اللي تحته يعتبر المنتج "قرب يخلص"
  isFavorite?: boolean;        // لو المستخدم معلم المنتج كمفضل
}
