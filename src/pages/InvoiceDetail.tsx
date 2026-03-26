import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { ArrowLeft, Printer, FileDown, Eye, Send, Wallet, User } from 'lucide-react';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoice() {
      if (!id) return;
      
      const { data: invData } = await supabase
        .from('invoices')
        .select(`*, customers (*)`)
        .eq('id', id)
        .single();
      
      if (invData) {
        setInvoice(invData);
        const { data: itemsData } = await supabase
          .from('invoice_items')
          .select('*')
          .eq('invoice_id', id);
        
        if (itemsData) setItems(itemsData);
      }
      setLoading(false);
    }
    fetchInvoice();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Loading Document...</div>;
  if (!invoice) return <div className="p-8 text-center text-red-500 font-bold">Document Not Found</div>;

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/invoices')} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-800 text-slate-800 tracking-tight">INV-{invoice.id.split('-')[0].substring(0,8)}</h1>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              Issued on {new Date(invoice.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="secondary" leftIcon={<Printer size={16} />} className="hidden sm:flex">Print</Button>
           <Button variant="secondary" leftIcon={<FileDown size={16} />} className="hidden sm:flex">PDF</Button>
           <Button leftIcon={<Send size={16} />} variant="success">Share Link</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-0">
               <div className="p-8 pb-10 border-b-8 border-blue-600 bg-white rounded-t-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Eye size={200} />
                 </div>
                 
                 <div className="flex justify-between items-start mb-12 relative z-10">
                    <div>
                      <h2 className="text-3xl font-900 text-blue-700 tracking-tighter uppercase mb-1">Invoice</h2>
                      <p className="text-sm font-bold text-slate-500 font-mono tracking-widest">INV-{invoice.id.substring(0,8)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-900 text-xl tracking-tight text-slate-800 mb-1">Jay Shree Traders</p>
                      <p className="text-xs font-medium text-slate-500">123 Business Park, Mumbai, MH</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-10 relative z-10">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 border-b border-slate-100 pb-1">Billed To</p>
                      <p className="font-bold text-slate-800 text-base">{invoice.customers?.name}</p>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">{invoice.customers?.phone}</p>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">{invoice.customers?.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 border-b border-slate-100 pb-1 text-right">Dates</p>
                      <table className="w-full text-xs font-semibold text-slate-600">
                        <tbody>
                          <tr><td className="py-1">Issued:</td><td className="py-1 text-right text-slate-800">{new Date(invoice.created_at).toLocaleDateString()}</td></tr>
                          {invoice.due_date && <tr><td className="py-1 text-red-500">Due:</td><td className="py-1 text-right text-red-600 font-bold">{new Date(invoice.due_date).toLocaleDateString()}</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <table className="w-full text-sm mb-8 relative z-10">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="text-left py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Description</th>
                        <th className="text-center py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Qty</th>
                        <th className="text-right py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Price</th>
                        <th className="text-right py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {items.map(item => (
                        <tr key={item.id}>
                          <td className="py-4 font-semibold text-slate-800">{item.item_name}</td>
                          <td className="py-4 text-center font-semibold text-slate-600">{item.quantity}</td>
                          <td className="py-4 text-right font-semibold text-slate-600">{formatCurrency(item.price)}</td>
                          <td className="py-4 text-right font-800 text-slate-800">{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex justify-end relative z-10">
                    <div className="w-64">
                      <div className="flex justify-between items-center pt-3 border-t-2 border-slate-800 text-blue-700">
                        <span className="font-800 uppercase tracking-wider text-xs">Total Amount</span>
                        <span className="font-900 text-2xl tracking-tight">{formatCurrency(invoice.total_amount)}</span>
                      </div>
                    </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
             <CardContent className="p-5 space-y-5">
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Action</p>
                  <Button className="w-full" size="lg" leftIcon={<Wallet size={18} />} onClick={() => navigate(`/payments/new?invoice=${invoice.id}&customer=${invoice.customer_id}`)}>
                    Record Payment
                  </Button>
               </div>
               <div className="pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Customer Profile</p>
                  <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate(`/customers/${invoice.customer_id}`)}>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                       <User size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{invoice.customers?.name}</p>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">View full ledger &rarr;</p>
                    </div>
                  </div>
               </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
