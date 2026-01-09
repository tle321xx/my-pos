export interface Product {
  id: number;
  name: string;
  price: number;
  weight?: number;
  unit?: string;
  quantity?: number;
  category?: 'weed' | 'instrument' | 'other';
  strain?: 'Indica' | 'Sativa' | 'Hybrid';
  tags?: string[];
  image?: string;
  active?: boolean;
  
  // [เพิ่ม 3 fields นี้]
  thc?: number;      // เปอร์เซ็นต์ THC
  ratio?: string;    // สัดส่วน (เช่น Indica 60%)
  scent?: string;    // กลิ่น
}