import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Chip } from '../components/ui/Badge';
import { Package, Search, Plus, AlertTriangle, X, TrendingUp } from 'lucide-react';

const categories = ['All', 'FMCG', 'Beverages', 'Snacks', 'Dairy', 'Personal Care'];

const initialProducts = [
  { id: 1, name: 'Coconut Premium Oil 1L',   category: 'FMCG',         price: 185,  stock: 42, sold: 1200, sku: 'CPO-001', alert: null },
  { id: 2, name: 'Bonos Assorted Biscuits',   category: 'Snacks',       price: 20,   stock: 3,  sold: 2200, sku: 'BAB-002', alert: 'low' },
  { id: 3, name: 'Amul Butter 500g',          category: 'Dairy',        price: 240,  stock: 0,  sold: 850,  sku: 'AMB-003', alert: 'out' },
  { id: 4, name: 'Thums Up 2L',              category: 'Beverages',    price: 80,   stock: 78, sold: 3100, sku: 'TU2-004', alert: null },
  { id: 5, name: 'Dove Soap 100g',           category: 'Personal Care', price: 65,  stock: 55, sold: 420,  sku: 'DS-005',  alert: null },
  { id: 6, name: 'Lays Classic 50g',         category: 'Snacks',       price: 20,   stock: 4,  sold: 5200, sku: 'LC-006',  alert: 'low' },
  { id: 7, name: 'Parle-G Original 1kg',     category: 'Snacks',       price: 95,   stock: 0,  sold: 910,  sku: 'PGO-007', alert: 'out' },
  { id: 8, name: 'Maggi Noodles 70g',        category: 'FMCG',         price: 14,   stock: 130,sold: 4800, sku: 'MN-008',  alert: null },
];

export default function Products() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [products, setProducts] = useState(initialProducts);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'FMCG', price: '', stock: '', sku: '' });

  const filtered = products.filter(p => {
    const matchCat = category === 'All' || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAdd = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) return;
    setProducts(prev => [...prev, {
      id: Date.now(),
      name: newProduct.name,
      category: newProduct.category,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock),
      sold: 0,
      sku: newProduct.sku || `SKU-${Date.now().toString().slice(-4)}`,
      alert: parseInt(newProduct.stock) === 0 ? 'out' : parseInt(newProduct.stock) <= 5 ? 'low' : null,
    }]);
    setNewProduct({ name: '', category: 'FMCG', price: '', stock: '', sku: '' });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-800 text-slate-800">Product Inventory</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">{products.length} products · {products.filter(p => p.alert).length} alerts</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => setShowAddForm(true)}>Add Product</Button>
      </div>

      {showAddForm && (
        <Card className="border-blue-200 shadow-lg ring-4 ring-blue-50">
          <CardHeader className="flex-row items-center justify-between border-b border-slate-100">
            <CardTitle>New Product</CardTitle>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-5 pt-5">
            <Input label="Product Name" placeholder="e.g. Coconut Oil 1L" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} className="col-span-2 md:col-span-2" />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</label>
              <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500">
                {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Input label="Price (₹)" type="number" placeholder="0" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
            <Input label="Stock Qty" type="number" placeholder="0" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} />
            <Input label="SKU (Optional)" placeholder="SKU-001" value={newProduct.sku} onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })} />
            <div className="col-span-2 md:col-span-3 flex justify-end gap-3 mt-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button variant="success" onClick={handleAdd}>Save Product</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products or SKU..."
            className="w-full h-11 bg-white border border-slate-200 rounded-xl pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap pb-1 overflow-x-auto hide-scrollbar">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                category === c ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(product => (
          <Card key={product.id} className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              {product.alert && (
                <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg mb-3 w-fit ${
                  product.alert === 'out' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                }`}>
                  <AlertTriangle size={12} strokeWidth={3} />
                  {product.alert === 'out' ? 'OUT OF STOCK' : 'LOW STOCK'}
                </div>
              )}

              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                  <Package size={20} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 leading-tight">{product.name}</p>
                  <p className="text-[11px] font-semibold text-slate-400 mt-1 font-mono bg-slate-50 px-1.5 py-0.5 rounded inline-block">{product.sku}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Price</p>
                  <p className="text-sm font-800 text-slate-800">₹{product.price}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Stock</p>
                  <p className={`text-sm font-800 ${product.stock === 0 ? 'text-red-500' : product.stock <= 5 ? 'text-amber-500' : 'text-slate-800'}`}>
                    {product.stock} <span className="text-xs font-semibold text-slate-500 font-normal">units</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
                <Chip variant="blue">{product.category}</Chip>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <div className="p-1 rounded bg-emerald-50"><TrendingUp size={12} strokeWidth={3} /></div>
                  {product.sold.toLocaleString()} sold
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Package size={48} className="mb-4 text-slate-200" strokeWidth={1.5} />
            <p className="text-base font-semibold text-slate-600">No products found</p>
            <p className="text-sm mt-1 text-slate-400">Try adjusting your search or category filter.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
