import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Building2, Mail, Phone, MapPin, Briefcase } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6 animate-fade-in max-w-3xl pb-10">
      <div>
        <h1 className="text-2xl font-800 text-slate-800">Business Settings</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Manage your business profile and preferences</p>
      </div>

      <Card>
        <CardHeader className="border-b border-slate-100"><CardTitle>Company Profile</CardTitle></CardHeader>
        <CardContent className="pt-6 grid gap-5">
           <div className="flex items-center gap-6 mb-2">
             <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm cursor-pointer hover:bg-blue-100 transition-colors">
               <Briefcase size={32} />
             </div>
             <div>
               <p className="text-sm font-bold text-slate-800">Company Logo</p>
               <p className="text-xs font-semibold text-slate-500 mt-1 mb-3">Recommended size: 256x256px (PNG/JPG)</p>
               <Button variant="secondary" size="sm">Upload Logo</Button>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <Input label="Business Name" defaultValue="BizPay Pro Enterprise" leftIcon={<Building2 size={16} />} />
             <Input label="Email Address" defaultValue="admin@bizpay.in" leftIcon={<Mail size={16} />} />
             <Input label="Phone Number" defaultValue="+91 98765 43210" leftIcon={<Phone size={16} />} />
             <Input label="GSTIN / Tax ID" defaultValue="27AADCB2230M1Z2" className="font-mono" />
             <Input label="Address Line 1" defaultValue="123 Business Park" leftIcon={<MapPin size={16} />} className="md:col-span-2" />
           </div>

           <div className="flex justify-end mt-4">
             <Button>Save Changes</Button>
           </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-slate-100"><CardTitle>Preferences</CardTitle></CardHeader>
        <CardContent className="pt-6 grid gap-5">
          <div className="flex justify-between items-center p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div>
              <p className="text-sm font-bold text-slate-800">Automated WhatsApp Reminders</p>
              <p className="text-xs font-medium text-slate-500">Send automatic payment links 2 days before due date</p>
            </div>
            <button className="relative w-12 h-7 rounded-full bg-blue-600 transition-colors">
               <span className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm translate-x-5 transition-transform" />
            </button>
          </div>
          <div className="flex justify-between items-center p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div>
              <p className="text-sm font-bold text-slate-800">Auto-Apply 2% Cash Discount</p>
              <p className="text-xs font-medium text-slate-500">Default to 2% cash discount on all new invoices</p>
            </div>
            <button className="relative w-12 h-7 rounded-full bg-slate-300 transition-colors">
               <span className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform" />
            </button>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center pt-8">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">BizPay Pro Version 2.0.0</p>
      </div>
    </div>
  );
}
