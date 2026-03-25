import { useState } from 'react';

export interface InvoiceItem {
  name: string;
  price: number;
  quantity: number;
  unit?: string;
}

export function useInvoiceBuilder() {
  const [items, setItems] = useState<InvoiceItem[]>([{ name: '', price: 0, quantity: 1 }]);
  const [cashDiscount, setCashDiscount] = useState(false);
  const discountRate = 0.02; // 2%

  const addItem = () => setItems(prev => [...prev, { name: '', price: 0, quantity: 1 }]);
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = <K extends keyof InvoiceItem>(i: number, field: K, value: InvoiceItem[K]) => {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  const discountAmount = cashDiscount ? subtotal * discountRate : 0;
  const total = subtotal - discountAmount;

  return {
    items, setItems,
    addItem, removeItem, updateItem,
    cashDiscount, setCashDiscount,
    subtotal, discountAmount, total,
    discountRate,
  };
}
