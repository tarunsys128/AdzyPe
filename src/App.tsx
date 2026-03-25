import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerForm from './pages/CustomerForm';
import CustomerDetail from './pages/CustomerDetail';
import Invoices from './pages/Invoices';
import InvoiceForm from './pages/InvoiceForm';
import InvoiceDetail from './pages/InvoiceDetail';
import Payments from './pages/Payments';
import PaymentForm from './pages/PaymentForm';
import Reminders from './pages/Reminders';
import Settings from './pages/Settings';
import Products from './pages/Products';
import Analytics from './pages/Analytics';
import ERPSync from './pages/ERPSync';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster 
        position="bottom-center" 
        toastOptions={{
          duration: 3000,
          style: {
            background: '#0F172A',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            padding: '12px 20px',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }} 
      />
      <Routes>
      <Route path="/login"  element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/"                  element={<Dashboard />} />
          <Route path="/customers"         element={<Customers />} />
          <Route path="/customers/new"     element={<CustomerForm />} />
          <Route path="/customers/:id"     element={<CustomerDetail />} />
          <Route path="/invoices"          element={<Invoices />} />
          <Route path="/invoices/new"      element={<InvoiceForm />} />
          <Route path="/invoices/:id"      element={<InvoiceDetail />} />
          <Route path="/payments"          element={<Payments />} />
          <Route path="/payments/new"      element={<PaymentForm />} />
          <Route path="/reminders"         element={<Reminders />} />
          <Route path="/products"          element={<Products />} />
          <Route path="/analytics"         element={<Analytics />} />
          <Route path="/erp-sync"          element={<ERPSync />} />
          <Route path="/settings"          element={<Settings />} />
          <Route path="*"                  element={<Navigate to="/" replace />} />
        </Route>
      </Route>
      </Routes>
    </>
  );
}

export default App;
