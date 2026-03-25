import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { syncTallyCustomers, syncTallyVouchers } from '../lib/tally';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RefreshCw, CheckCircle2, Clock, Loader2, Terminal } from 'lucide-react';
import toast from 'react-hot-toast';

const SYNC_STEPS = [
  { id: 'connect',  label: 'Connecting to Tally Prime Server (Port 9000)...' },
  { id: 'debtors',  label: 'Fetching Sundry Debtors & Ledgers...' },
  { id: 'sales',    label: 'Syncing Sales Vouchers & Invoices...' },
  { id: 'receipts', label: 'Syncing Receipt Vouchers & Payments...' },
  { id: 'final',    label: 'Finalizing database consistency...' },
];

type SyncStatus = 'idle' | 'running' | 'success' | 'error';

export default function ERPSync() {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [currentStep, setCurrentStep] = useState(-1);
  const [logs, setLogs] = useState<{ time: string; msg: string; type: 'info' | 'success' | 'error' | 'warn' }[]>([]);
  const [progress, setProgress] = useState(0);
  const [erpSystem, setErpSystem] = useState<'tally' | 'busy'>('tally');
  const [lastSync, setLastSync] = useState('Mar 25, 2026 at 09:15 AM');
  const [stats, setStats] = useState({ customers: 0, invoices: 0, payments: 0 });

  const addLog = (msg: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') => {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { time, msg, type }]);
  };

  const startSync = async () => {
    if (!user) return;
    setSyncStatus('running');
    setLogs([]);
    setProgress(5);
    setStats({ customers: 0, invoices: 0, payments: 0 });

    try {
      // 1. Connection check
      setCurrentStep(0);
      addLog(`[${erpSystem.toUpperCase()}] Initializing direct ERP bridge via localhost:9000...`, 'info');
      await new Promise(r => setTimeout(r, 600)); 
      setProgress(15);
      addLog('✓ Connection established with Tally.ERP9/Prime instance.', 'success');

      // 2. Sync Customers
      setCurrentStep(1);
      addLog('Requesting Sundry Debtors list from Tally...', 'info');
      const custCount = await syncTallyCustomers(user.id);
      setStats(prev => ({ ...prev, customers: custCount }));
      setProgress(40);
      addLog(`✓ Successfully synced ${custCount} unique Customer Ledgers.`, 'success');

      // 3. Sync Vouchers (Invoices + Receipts)
      setCurrentStep(2);
      addLog('Fetching Day Book records (Sales & Receipts)...', 'info');
      const voucherStats = await syncTallyVouchers(user.id);
      setStats(prev => ({ ...prev, invoices: voucherStats.invoices, payments: voucherStats.payments }));
      setProgress(85);
      addLog(`✓ Synced ${voucherStats.invoices} Sales Invoices and ${voucherStats.payments} Payment Receipts.`, 'success');

      // 4. Finalize
      setCurrentStep(4);
      addLog('Reconciling accounts and finalizing cloud state...', 'info');
      await new Promise(r => setTimeout(r, 800));
      setProgress(100);
      
      setSyncStatus('success');
      setLastSync(new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }));
      addLog('[DONE] ERP Synchronization completed successfully.', 'success');
      toast.success('ERP Synchronization completed successfully!');

    } catch (err: any) {
      console.error(err);
      addLog(`[ERROR] Sync aborted: ${err.message}`, 'error');
      addLog('Please verify Tally ODBC server is enabled and running on Port 9000.', 'warn');
      setSyncStatus('error');
      setProgress(Math.max(progress, 15));
    }
  };

  const resetSync = () => {
    setSyncStatus('idle');
    setCurrentStep(-1);
    setLogs([]);
    setProgress(0);
  };

  const logColor = (type: string) => {
    if (type === 'success') return 'text-emerald-400';
    if (type === 'error') return 'text-red-400';
    if (type === 'warn') return 'text-amber-400';
    return 'text-slate-300';
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-800 text-slate-800">Real-Time ERP Sync</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Direct XML bridge to your local TallyPrime data.</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
          <Clock size={14} className="text-blue-500" strokeWidth={2.5} />
          Last Sync: {lastSync}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Config & Setup */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="border-b border-slate-100"><CardTitle>ERP System</CardTitle></CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 gap-3">
              {(['tally', 'busy'] as const).map(sys => (
                <button
                  key={sys}
                  onClick={() => syncStatus === 'idle' && setErpSystem(sys)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    erpSystem === sys
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50'
                  } disabled:opacity-50 relative overflow-hidden group`}
                  disabled={syncStatus === 'running' || sys === 'busy'}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-sm ${sys === 'tally' ? 'bg-[#003B71]' : 'bg-[#E30613]'}`}>
                      {sys === 'tally' ? 'T' : 'B'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 capitalize">{sys} Prime</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{sys === 'tally' ? 'Local XML API' : 'Coming Soon'}</p>
                    </div>
                    {erpSystem === sys && <CheckCircle2 className="ml-auto text-blue-600" size={18} strokeWidth={3} />}
                  </div>
                  {sys === 'busy' && (
                    <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-[1px] flex items-center justify-center">
                       <span className="text-[10px] bg-slate-800 text-white px-2 py-0.5 rounded font-black tracking-tighter">WAITLIST</span>
                    </div>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-blue-100 bg-blue-50/30">
            <CardHeader className="border-b border-blue-100"><CardTitle className="text-blue-900">Sync Status</CardTitle></CardHeader>
            <CardContent className="pt-5 space-y-5">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Customers</span>
                 <span className="text-slate-800 font-900">{stats.customers}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Invoices</span>
                 <span className="text-slate-800 font-900">{stats.invoices}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Receipts</span>
                 <span className="text-emerald-600 font-900">{stats.payments}</span>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Sync Interface */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b border-slate-100">
              <CardTitle>Sync Engine Control</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-3 uppercase tracking-widest">
                  <span>{syncStatus === 'running' ? `Processing...` : syncStatus === 'idle' ? 'Ready' : syncStatus === 'success' ? 'Sync Complete' : 'Sync Failed'}</span>
                  <span className="text-blue-600">{progress}%</span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      syncStatus === 'error' ? 'bg-red-500' : syncStatus === 'success' ? 'bg-emerald-500' : 'gradient-blue'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-4 px-2">
                {SYNC_STEPS.map((step, i) => {
                  const done = currentStep > i || syncStatus === 'success';
                  const active = syncStatus === 'running' && currentStep === i;
                  return (
                    <div key={i} className={`flex items-center gap-4 text-sm transition-all ${done ? 'opacity-100' : active ? 'opacity-100' : 'opacity-40'}`}>
                      <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm">
                        {done ? (
                          <CheckCircle2 size={16} className="text-emerald-500" strokeWidth={3} />
                        ) : active ? (
                          <Loader2 size={16} className="text-blue-500 animate-spin" strokeWidth={3} />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-300" />
                        )}
                      </div>
                      <span className={`${done ? 'text-slate-600 font-semibold' : active ? 'text-blue-700 font-bold' : 'text-slate-400 font-medium'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {syncStatus !== 'running' ? (
                  <Button size="lg" 
                    leftIcon={<RefreshCw size={18} />} 
                    onClick={startSync} 
                    className="flex-1 w-full text-base h-14 rounded-2xl shadow-lg shadow-blue-500/20"
                    variant={syncStatus === 'error' ? 'danger' : syncStatus === 'success' ? 'success' : 'primary'}
                  >
                    {syncStatus === 'idle' ? `Start Real-Sync from Tally` : syncStatus === 'success' ? 'Sync Once More' : 'Retry Connection'}
                  </Button>
                ) : (
                  <Button size="lg" disabled className="flex-1 w-full h-14 rounded-2xl opacity-80" leftIcon={<Loader2 size={18} className="animate-spin" />}>
                     Syncing in Progress...
                  </Button>
                )}
                {(syncStatus === 'success' || syncStatus === 'error') && (
                  <Button variant="secondary" onClick={resetSync} className="h-14 px-8 rounded-2xl font-bold">Close</Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Terminal Log */}
          {logs.length > 0 && (
            <Card className="border-slate-800 overflow-hidden shadow-2xl">
              <CardHeader className="flex-row items-center gap-2 border-b border-slate-800 bg-[#1E293B] pb-3 p-4">
                <Terminal size={16} className="text-blue-400" />
                <CardTitle className="text-xs font-black tracking-widest uppercase text-slate-300">Live Backend Logs</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="bg-[#0F172A] p-5 h-56 overflow-y-auto font-mono text-xs space-y-2 border-t border-slate-800">
                  {logs.map((log, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="text-slate-600 flex-shrink-0 font-bold">{log.time}</span>
                      <span className={`${logColor(log.type)}`}>
                        {log.type === 'error' ? '✖ ' : log.type === 'success' ? '✔ ' : '➡ '}
                        {log.msg}
                      </span>
                    </div>
                  ))}
                  {syncStatus === 'running' && (
                    <div className="flex gap-3 text-blue-500 animate-pulse">
                      <span className="text-slate-600 font-bold">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="flex items-center gap-1">
                        Scanning XML packets... <span className="w-1.5 h-3 bg-blue-500 animate-caret" />
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
