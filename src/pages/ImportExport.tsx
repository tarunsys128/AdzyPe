import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import {
  Upload, Download, FileSpreadsheet, Users, FileText,
  CheckCircle, AlertCircle, Package, CreditCard,
  RefreshCw, Database, Trash2
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

type StatusMessage = { type: 'success' | 'error' | 'info'; text: string } | null;

interface ImportSection {
  key: string;
  label: string;
  description: string;
  columns: string[];
  icon: React.ReactNode;
  color: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const readExcel = (file: File): Promise<any[]> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target!.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      resolve(XLSX.utils.sheet_to_json(sheet, { defval: '' }));
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

const exportToExcel = (rows: any[], filename: string, sheetName = 'Sheet1') => {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
};

// ── Import Sections Config ────────────────────────────────────────────────────

const importSections: ImportSection[] = [
  {
    key: 'customers',
    label: 'Customers',
    description: 'Import all your contacts — clients, individuals, or businesses.',
    columns: ['name*', 'email', 'phone', 'business_name', 'city', 'address'],
    icon: <Users className="h-5 w-5" />,
    color: 'indigo',
  },
  {
    key: 'invoices',
    label: 'Invoices',
    description: 'Import your invoices. customer_name must match an existing customer.',
    columns: ['customer_name*', 'total_amount*', 'status', 'due_date', 'notes'],
    icon: <FileText className="h-5 w-5" />,
    color: 'blue',
  },
  {
    key: 'products',
    label: 'Products / Services',
    description: 'Import your product catalogue or service list.',
    columns: ['name*', 'description', 'price*', 'unit', 'stock', 'category'],
    icon: <Package className="h-5 w-5" />,
    color: 'violet',
  },
  {
    key: 'payments',
    label: 'Payments',
    description: 'Import payment records. invoice_id must match an existing invoice short-ID.',
    columns: ['customer_name*', 'amount*', 'payment_method', 'reference_number', 'paid_at'],
    icon: <CreditCard className="h-5 w-5" />,
    color: 'emerald',
  },
];

// ── Color Map ─────────────────────────────────────────────────────────────────

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string; badgeBg: string }> = {
  indigo:  { bg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-600',  badge: 'text-indigo-700',  badgeBg: 'bg-indigo-100' },
  blue:    { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-600',    badge: 'text-blue-700',    badgeBg: 'bg-blue-100' },
  violet:  { bg: 'bg-violet-50',  border: 'border-violet-200',  text: 'text-violet-600',  badge: 'text-violet-700',  badgeBg: 'bg-violet-100' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', badge: 'text-emerald-700', badgeBg: 'bg-emerald-100' },
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-600',   badge: 'text-amber-700',   badgeBg: 'bg-amber-100' },
  slate:   { bg: 'bg-slate-50',   border: 'border-slate-200',   text: 'text-slate-600',   badge: 'text-slate-700',   badgeBg: 'bg-slate-100' },
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function ImportExport() {
  const { user } = useAuth();
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [importing, setImporting] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusMessage>(null);

  const showStatus = (type: StatusMessage['type'], text: string) => {
    setStatus({ type, text });
    setTimeout(() => setStatus(null), 6000);
  };

  // ── Template Download ─────────────────────────────────────────────────────

  const downloadTemplate = (section: ImportSection) => {
    const columns = section.columns.map(c => c.replace('*', ''));
    const sampleRow: Record<string, string> = {};
    columns.forEach(col => { sampleRow[col] = `sample_${col}`; });
    exportToExcel([sampleRow], `template-${section.key}.xlsx`, section.label);
  };

  // ── Import Handlers ───────────────────────────────────────────────────────

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setImporting(key);
    setStatus(null);

    try {
      const rows = await readExcel(file);
      if (rows.length === 0) throw new Error('File is empty or could not be parsed.');

      let inserted = 0;
      let skipped = 0;

      if (key === 'customers') {
        const toInsert = rows
          .map((r: any) => ({
            user_id: user.id,
            name: r.name || r.Name || r.NAME || '',
            email: r.email || r.Email || '',
            phone: `${r.phone || r.Phone || r.mobile || ''}`,
            business_name: r.business_name || r.company || r.Company || '',
            city: r.city || r.City || '',
            address: r.address || r.Address || '',
          }))
          .filter(c => c.name.trim());
        if (toInsert.length === 0) throw new Error('No valid rows found. Check that "name" column is present.');
        const { error } = await supabase.from('customers').insert(toInsert);
        if (error) throw error;
        inserted = toInsert.length;
        skipped = rows.length - inserted;
      }

      else if (key === 'invoices') {
        const { data: customers } = await supabase.from('customers').select('id, name').eq('user_id', user.id);
        const customerMap: Record<string, string> = {};
        (customers || []).forEach(c => { customerMap[c.name.trim().toLowerCase()] = c.id; });

        const toInsert: any[] = [];
        for (const r of rows) {
          const customerKey = (r.customer_name || r.customer || '').trim().toLowerCase();
          const customerId = customerMap[customerKey];
          if (!customerId) { skipped++; continue; }
          toInsert.push({
            user_id: user.id,
            customer_id: customerId,
            total_amount: Number(r.total_amount || r.amount || 0),
            status: r.status || 'Pending',
            due_date: r.due_date || null,
            notes: r.notes || '',
          });
        }
        if (toInsert.length > 0) {
          const { error } = await supabase.from('invoices').insert(toInsert);
          if (error) throw error;
        }
        inserted = toInsert.length;
      }

      else if (key === 'products') {
        const toInsert = rows
          .map((r: any) => ({
            user_id: user.id,
            name: r.name || r.Name || r.NAME || '',
            description: r.description || r.Description || '',
            price: Number(r.price || r.Price || r.rate || 0),
            unit: r.unit || r.Unit || 'pcs',
            stock: Number(r.stock || r.Stock || 0),
            category: r.category || r.Category || '',
          }))
          .filter(p => p.name.trim() && p.price > 0);
        if (toInsert.length === 0) throw new Error('No valid rows. Ensure "name" and "price" columns exist.');
        const { error } = await supabase.from('products').insert(toInsert);
        if (error) throw error;
        inserted = toInsert.length;
        skipped = rows.length - inserted;
      }

      else if (key === 'payments') {
        // Fetch customers & their invoices to match
        const { data: customers } = await supabase.from('customers').select('id, name').eq('user_id', user.id);
        const customerMap: Record<string, string> = {};
        (customers || []).forEach(c => { customerMap[c.name.trim().toLowerCase()] = c.id; });

        const { data: invoices } = await supabase.from('invoices').select('id, customer_id').eq('user_id', user.id);
        const invByCustomer: Record<string, string> = {};
        (invoices || []).forEach(inv => { invByCustomer[inv.customer_id] = inv.id; });

        const toInsert: any[] = [];
        for (const r of rows) {
          const customerKey = (r.customer_name || r.customer || '').trim().toLowerCase();
          const customerId = customerMap[customerKey];
          if (!customerId) { skipped++; continue; }
          const invoiceId = invByCustomer[customerId];
          toInsert.push({
            user_id: user.id,
            customer_id: customerId,
            invoice_id: invoiceId || null,
            amount: Number(r.amount || r.Amount || 0),
            payment_method: r.payment_method || r.method || 'Manual',
            reference_number: r.reference_number || r.ref || '',
            paid_at: r.paid_at || r.date || new Date().toISOString(),
            status: 'Completed',
          });
        }
        if (toInsert.length > 0) {
          const { error } = await supabase.from('payments').insert(toInsert);
          if (error) throw error;
        }
        inserted = toInsert.length;
      }

      showStatus('success', `✅ Imported ${inserted} ${key} successfully.${skipped > 0 ? ` (${skipped} rows skipped due to missing required fields)` : ''}`);
    } catch (err: any) {
      showStatus('error', `❌ Import failed: ${err.message}`);
    }

    setImporting(null);
    e.target.value = '';
  };

  // ── Export Handlers ───────────────────────────────────────────────────────

  const handleExport = async (key: string) => {
    if (!user) return;
    setExporting(key);
    try {
      if (key === 'customers') {
        const { data } = await supabase.from('customers').select('name,email,phone,business_name,city,address,created_at').eq('user_id', user.id).order('name');
        exportToExcel(data || [], 'adzy-customers.xlsx', 'Customers');
      }
      else if (key === 'invoices') {
        const { data } = await supabase.from('invoices').select('id,total_amount,status,due_date,created_at,notes,customers(name)').eq('user_id', user.id).order('created_at', { ascending: false });
        const rows = (data || []).map((inv: any) => ({
          invoice_id: inv.id.substring(0, 8),
          customer_name: inv.customers?.name || '',
          total_amount: inv.total_amount,
          status: inv.status,
          due_date: inv.due_date || '',
          notes: inv.notes || '',
          created_at: inv.created_at,
        }));
        exportToExcel(rows, 'adzy-invoices.xlsx', 'Invoices');
      }
      else if (key === 'products') {
        const { data } = await supabase.from('products').select('name,description,price,unit,stock,category,created_at').eq('user_id', user.id).order('name');
        exportToExcel(data || [], 'adzy-products.xlsx', 'Products');
      }
      else if (key === 'payments') {
        const { data } = await supabase.from('payments').select('amount,payment_method,reference_number,paid_at,status,customers(name),invoices(id)').eq('user_id', user.id).order('paid_at', { ascending: false });
        const rows = (data || []).map((p: any) => ({
          customer_name: p.customers?.name || '',
          invoice_id: p.invoices?.id?.substring(0, 8) || '',
          amount: p.amount,
          payment_method: p.payment_method || '',
          reference_number: p.reference_number || '',
          paid_at: p.paid_at || '',
          status: p.status,
        }));
        exportToExcel(rows, 'adzy-payments.xlsx', 'Payments');
      }
      else if (key === 'full') {
        // Export ALL data in a single multi-sheet workbook
        const [custRes, invRes, prodRes, payRes] = await Promise.all([
          supabase.from('customers').select('name,email,phone,business_name,city,address,created_at').eq('user_id', user.id),
          supabase.from('invoices').select('id,total_amount,status,due_date,created_at,customers(name)').eq('user_id', user.id),
          supabase.from('products').select('name,description,price,unit,stock,category').eq('user_id', user.id),
          supabase.from('payments').select('amount,payment_method,reference_number,paid_at,customers(name)').eq('user_id', user.id),
        ]);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(custRes.data || []), 'Customers');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
          (invRes.data || []).map((i: any) => ({ ...i, customer_name: i.customers?.name || '' }))
        ), 'Invoices');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(prodRes.data || []), 'Products');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
          (payRes.data || []).map((p: any) => ({ ...p, customer_name: p.customers?.name || '' }))
        ), 'Payments');
        XLSX.writeFile(wb, `adzy-full-export-${new Date().toISOString().split('T')[0]}.xlsx`);
      }
      showStatus('success', `✅ ${key === 'full' ? 'Full business data' : key} exported successfully.`);
    } catch (err: any) {
      showStatus('error', `❌ Export failed: ${err.message}`);
    }
    setExporting(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-800 text-slate-800">Import & Export</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Bulk upload or download all your business data</p>
        </div>

        {/* Full Export CTA */}
        <button
          onClick={() => handleExport('full')}
          disabled={exporting === 'full'}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl shadow transition-all active:scale-95 disabled:opacity-60 shrink-0"
        >
          {exporting === 'full' ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Database className="h-4 w-4" />
          )}
          Export All Data (.xlsx)
        </button>
      </div>

      {/* Status Toast */}
      {status && (
        <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm font-medium transition-all ${
          status.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          status.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
          'bg-blue-50 border-blue-200 text-blue-700'
        }`}>
          {status.type === 'success' ? <CheckCircle className="h-5 w-5 mt-0.5 shrink-0" /> : <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />}
          <span>{status.text}</span>
        </div>
      )}

      {/* ── Import Section ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Upload className="h-5 w-5 text-slate-500" />
          <h2 className="text-lg font-bold text-slate-800">Import Data</h2>
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">Supports .xlsx .xls .csv</span>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {importSections.map(section => {
            const c = colorMap[section.color];
            const isLoading = importing === section.key;
            return (
              <Card key={section.key} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className={`p-2 rounded-lg ${c.bg} ${c.text} border ${c.border}`}>
                      {section.icon}
                    </span>
                    Import {section.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-500">{section.description}</p>

                  {/* Required Columns */}
                  <div className="flex flex-wrap gap-1.5">
                    {section.columns.map(col => {
                      const required = col.endsWith('*');
                      const name = col.replace('*', '');
                      return (
                        <span
                          key={col}
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            required ? `${c.badgeBg} ${c.badge}` : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {name}{required ? ' *' : ''}
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex gap-2">
                    {/* Template download */}
                    <button
                      onClick={() => downloadTemplate(section)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" /> Template
                    </button>

                    {/* File upload */}
                    <input
                      ref={el => { fileRefs.current[section.key] = el; }}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={e => handleImport(e, section.key)}
                    />
                    <button
                      onClick={() => fileRefs.current[section.key]?.click()}
                      disabled={isLoading}
                      className={`flex-[2] flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold transition-all ${c.bg} ${c.text} border ${c.border} hover:opacity-80 active:scale-95 disabled:opacity-60`}
                    >
                      {isLoading ? (
                        <><RefreshCw className="h-4 w-4 animate-spin" /> Importing…</>
                      ) : (
                        <><FileSpreadsheet className="h-4 w-4" /> Upload File</>
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── Export Section ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Download className="h-5 w-5 text-slate-500" />
          <h2 className="text-lg font-bold text-slate-800">Export Data</h2>
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">Downloads .xlsx</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'customers', label: 'Customers',  icon: <Users className="h-6 w-6" />,     color: 'indigo' },
            { key: 'invoices',  label: 'Invoices',   icon: <FileText className="h-6 w-6" />,   color: 'blue' },
            { key: 'products',  label: 'Products',   icon: <Package className="h-6 w-6" />,    color: 'violet' },
            { key: 'payments',  label: 'Payments',   icon: <CreditCard className="h-6 w-6" />, color: 'emerald' },
          ].map(({ key, label, icon, color }) => {
            const c = colorMap[color];
            const isLoading = exporting === key;
            return (
              <button
                key={key}
                onClick={() => handleExport(key)}
                disabled={isLoading}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all group active:scale-95 disabled:opacity-60"
              >
                <div className={`p-3 rounded-xl ${c.bg} ${c.text} border ${c.border} group-hover:scale-110 transition-transform`}>
                  {isLoading ? <RefreshCw className="h-6 w-6 animate-spin" /> : icon}
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm text-slate-800">{label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Download .xlsx</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Danger Zone ───────────────────────────────────────────────────── */}
      <div className="border border-red-200 rounded-2xl p-5 bg-red-50/50">
        <div className="flex items-center gap-2 mb-3">
          <Trash2 className="h-4 w-4 text-red-500" />
          <h2 className="font-bold text-sm text-red-700">Danger Zone</h2>
        </div>
        <p className="text-xs text-red-600 mb-4">These actions are permanent and cannot be undone. Use with caution.</p>
        <div className="flex flex-wrap gap-3">
          {(['customers', 'invoices', 'products', 'payments'] as const).map(key => (
            <button
              key={key}
              className="text-xs font-bold px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-100 transition-colors"
              onClick={async () => {
                if (!user) return;
                if (!window.confirm(`Delete ALL ${key} for your account? This cannot be undone.`)) return;
                await supabase.from(key).delete().eq('user_id', user.id);
                showStatus('info', `🗑️ All ${key} have been deleted.`);
              }}
            >
              Clear All {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
