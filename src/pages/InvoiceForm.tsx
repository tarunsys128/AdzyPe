import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useInvoiceBuilder } from '../hooks/useInvoiceBuilder';
import { ArrowLeft, Plus, Trash2, Eye, EyeOff, Zap, Building2, Calendar, Hash } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export default function InvoiceForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledCustomer = searchParams.get('customer') || '';

  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [customerId, setCustomerId] = useState(prefilledCustomer);
  const [dueDate, setDueDate] = useState('');
  const [invoiceNote, setInvoiceNote] = useState('');
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const invoiceNumber = `INV-${Date.now().toString().slice(-5)}`;

  const { items, addItem, removeItem, updateItem, cashDiscount, setCashDiscount, subtotal, discountAmount, total } = useInvoiceBuilder();

  useEffect(() => {
    async function fetchCustomers() {
      if (!user) return;
      const { data } = await supabase.from('customers').select('id, name, phone').eq('user_id', user.id);
      if (data) setCustomers(data);
    }
    fetchCustomers();
  }, [user]);

  const selectedCustomer = customers.find(c => c.id === customerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!customerId) return setError('Please select a customer.');
    if (items.some(i => !i.name || i.price <= 0 || i.quantity <= 0)) return setError('Please fill all item details correctly.');

    setLoading(true);
    setError('');

    const { data: invoice, error: invError } = await supabase.from('invoices').insert([{
      user_id: user.id,
      customer_id: customerId,
      total_amount: total,
      due_date: dueDate || null,
      status: 'Pending'
    }]).select().single();

    if (invError) { setError(invError.message); setLoading(false); return; }

    const itemsToInsert = items.map(item => ({
      invoice_id: invoice.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity
    }));
    const { error: itemsError } = await supabase.from('invoice_items').insert(itemsToInsert);
    if (itemsError) setError(itemsError.message);
    else navigate(`/invoices/${invoice.id}`);
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/invoices')} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-800 text-slate-800">New Invoice</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">Smart Split-Screen Builder</p>
          </div>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
        >
          {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
          {showPreview ? 'Hide Preview' : 'Preview PDF'}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm font-bold text-red-600 animate-slide-up">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1 max-w-3xl mx-auto'}`}>
          <div className="space-y-6">
            <Card>
              <CardHeader className="border-b border-slate-100"><CardTitle>Invoice Details</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Customer *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      className="flex h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      value={customerId}
                      onChange={e => setCustomerId(e.target.value)}
                      required
                    >
                      <option value="" disabled>Select a customer...</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  {selectedCustomer?.phone && <p className="text-xs font-medium text-slate-500 pl-1 mt-1">📞 {selectedCustomer.phone}</p>}
                </div>
                <Input
                  label="Due Date (Optional)"
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  leftIcon={<Calendar size={16} />}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between border-b border-slate-100">
                <CardTitle>Line Items</CardTitle>
                <Button type="button" variant="secondary" size="sm" leftIcon={<Plus size={16} />} onClick={addItem}>Add Item</Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                {items.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl relative group transition-all">
                    <div className="flex-1">
                      <Input placeholder="Item description..." value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} required />
                    </div>
                    <div className="w-full sm:w-28">
                      <Input placeholder="Price ₹" type="number" min="0" step="0.01" value={item.price || ''} onChange={e => updateItem(idx, 'price', parseFloat(e.target.value) || 0)} required />
                    </div>
                    <div className="w-full sm:w-20">
                      <Input placeholder="Qty" type="number" min="1" value={item.quantity || ''} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)} required />
                    </div>
                    <div className="sm:w-24 flex items-center justify-end">
                      <span className="text-sm font-800 text-slate-800">₹{(Number(item.price) * Number(item.quantity)).toLocaleString('en-IN')}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      disabled={items.length === 1}
                      className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center text-red-500 shadow-sm opacity-0 group-hover:opacity-100 disabled:hidden hover:bg-red-50 hover:border-red-200 transition-all z-10"
                    >
                      <Trash2 size={13} strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-500">Subtotal</span>
                    <span className="text-sm font-800 text-slate-800">{formatCurrency(subtotal)}</span>
                  </div>

                  <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${cashDiscount ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cashDiscount ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                        <Zap size={20} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${cashDiscount ? 'text-emerald-800' : 'text-slate-700'}`}>Early Payment Discount</p>
                        <p className={`text-xs font-semibold ${cashDiscount ? 'text-emerald-600' : 'text-slate-500'}`}>Apply 2% cash discount</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCashDiscount(!cashDiscount)}
                      className={`relative w-12 h-7 rounded-full transition-colors ${cashDiscount ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                      <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${cashDiscount ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {cashDiscount && (
                    <div className="flex items-center justify-between text-emerald-600 animate-slide-up">
                      <span className="text-sm font-bold">Cash Discount (2%)</span>
                      <span className="text-sm font-800">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}

                  <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
                    <span className="text-base font-bold text-slate-800">Total Amount</span>
                    <span className="text-2xl font-800 text-blue-600 tracking-tight">{formatCurrency(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Note (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Terms, notes, or payment instructions..."
                  value={invoiceNote}
                  onChange={e => setInvoiceNote(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 resize-none shadow-sm transition-all"
                />
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
              <Button type="button" variant="outline" size="lg" onClick={() => navigate('/invoices')} className="w-full sm:w-auto">Cancel</Button>
              <Button type="submit" isLoading={loading} size="lg" leftIcon={<Hash size={18} />} className="w-full sm:w-auto">Generate Invoice</Button>
            </div>
          </div>

          {/* Live Preview Panel - Desktop */}
          {showPreview && (
            <div className={`lg:block ${showPreview ? 'block' : 'hidden'}`}>
              <div className="sticky top-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live Document Preview</p>
                  <Button variant="ghost" size="sm" leftIcon={<EyeOff size={14} />} onClick={() => setShowPreview(false)} className="lg:hidden">Close Preview</Button>
                </div>
                <div className="bg-white rounded-xl shadow-xl ring-1 ring-slate-200/50 p-6 sm:p-10 min-h-[600px] text-slate-800 animate-fade-in relative overflow-hidden">
                  
                  {/* Subtle Background Mark for Realism */}
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Zap size={200} />
                  </div>

                  <div className="flex justify-between items-start mb-12 relative z-10">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                          <Zap size={14} className="text-white" />
                        </div>
                        <span className="font-900 text-xl tracking-tight text-blue-700">BizPay Pro</span>
                      </div>
                      <p className="text-xs font-medium text-slate-500">123 Business Park, Industrial Est.<br/>Mumbai, MH 400001</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-900 text-slate-800 tracking-tighter uppercase mb-1">Invoice</p>
                      <p className="text-sm font-bold text-slate-500 font-mono tracking-widest">{invoiceNumber}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-10 relative z-10">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 border-b border-slate-100 pb-1">Billed To</p>
                      {selectedCustomer ? (
                        <>
                          <p className="font-bold text-slate-800 text-base">{selectedCustomer.name}</p>
                          {selectedCustomer.phone && <p className="text-xs font-semibold text-slate-500 mt-0.5">{selectedCustomer.phone}</p>}
                        </>
                      ) : (
                        <p className="italic text-slate-400 text-sm font-medium">Customer details will appear here</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 border-b border-slate-100 pb-1 text-right">Invoice Details</p>
                      <table className="w-full text-xs font-semibold text-slate-600">
                        <tbody>
                          <tr><td className="py-1">Date:</td><td className="py-1 text-right text-slate-800">{today}</td></tr>
                          {dueDate && <tr><td className="py-1">Due Date:</td><td className="py-1 text-right text-slate-800">{new Date(dueDate).toLocaleDateString('en-IN')}</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <table className="w-full text-sm mb-8 relative z-10">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="text-left py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Item Description</th>
                        <th className="text-center py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Qty</th>
                        <th className="text-right py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Price</th>
                        <th className="text-right py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.filter(i => i.name).length > 0 ? items.filter(i => i.name).map((item, idx) => (
                        <tr key={idx} className="group">
                          <td className="py-4 font-semibold text-slate-800">{item.name}</td>
                          <td className="py-4 text-center font-semibold text-slate-600">{item.quantity}</td>
                          <td className="py-4 text-right font-semibold text-slate-600">₹{Number(item.price).toLocaleString('en-IN')}</td>
                          <td className="py-4 text-right font-800 text-slate-800">₹{(Number(item.price) * Number(item.quantity)).toLocaleString('en-IN')}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} className="py-8 text-center text-slate-400 italic text-sm font-medium">Add items on the left to see them here</td></tr>
                      )}
                    </tbody>
                  </table>

                  <div className="flex justify-end mb-10 relative z-10">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                        <span>Subtotal</span>
                        <span className="text-slate-800 text-base">₹{subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      {cashDiscount && (
                        <div className="flex justify-between items-center text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                          <span>Discount (2%)</span>
                          <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-3 border-t-2 border-slate-800 text-blue-700">
                        <span className="font-800 uppercase tracking-wider text-xs">Total Amount</span>
                        <span className="font-900 text-2xl tracking-tight">₹{total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {invoiceNote && (
                    <div className="mt-8 p-4 bg-slate-50 rounded-xl relative z-10 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Note / Terms</p>
                      <p className="text-xs font-semibold text-slate-700 whitespace-pre-line leading-relaxed">{invoiceNote}</p>
                    </div>
                  )}

                  <div className="mt-12 pt-6 border-t border-slate-100 text-center relative z-10">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Thank you for your business!</p>
                    <p className="text-xs font-semibold text-slate-500">Generated securely by BizPay Pro Fintech</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
