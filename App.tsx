
import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './components/layouts/PublicLayout';
import { AdminLayout } from './components/layouts/AdminLayout';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import { MasterDataProvider } from './context/MasterDataContext';
import { ToastProvider } from './components/ui/Toast';

// Lazy load pages to reduce initial bundle size
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Packages = lazy(() => import('./pages/Packages').then(module => ({ default: module.Packages })));
const PackageDetail = lazy(() => import('./pages/PackageDetail').then(module => ({ default: module.PackageDetail })));
const About = lazy(() => import('./pages/About').then(module => ({ default: module.About })));
const Contact = lazy(() => import('./pages/Contact').then(module => ({ default: module.Contact })));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));

const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const Inventory = lazy(() => import('./pages/admin/Inventory').then(module => ({ default: module.Inventory })));
const Analytics = lazy(() => import('./pages/admin/Analytics').then(module => ({ default: module.Analytics })));
const ItineraryBuilder = lazy(() => import('./pages/admin/ItineraryBuilder').then(module => ({ default: module.ItineraryBuilder })));
const StaffManagement = lazy(() => import('./pages/admin/StaffManagement').then(module => ({ default: module.StaffManagement })));
const Bookings = lazy(() => import('./pages/admin/Bookings').then(module => ({ default: module.Bookings })));
const AdminLeads = lazy(() => import('./pages/admin/Leads').then(module => ({ default: module.Leads })));
const AdminCustomers = lazy(() => import('./pages/admin/Customers').then(module => ({ default: module.Customers })));
const AdminPackages = lazy(() => import('./pages/admin/Packages').then(module => ({ default: module.AdminPackages })));
const Vendors = lazy(() => import('./pages/admin/Vendors').then(module => ({ default: module.Vendors })));
const AdminAccounts = lazy(() => import('./pages/admin/Accounts').then(module => ({ default: module.Accounts })));
const Masters = lazy(() => import('./pages/admin/Masters').then(module => ({ default: module.Masters })));

// Loading Fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-3">
      <div className="size-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      <p className="text-slate-400 text-sm font-medium animate-pulse">Loading...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MasterDataProvider>
        <DataProvider>
          <ToastProvider />
          <HashRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes using PublicLayout (Header/Footer) */}
                <Route path="/" element={<PublicLayout />}>
                  <Route index element={<Home />} />
                  <Route path="packages" element={<Packages />} />
                  <Route path="packages/:id" element={<PackageDetail />} />
                  <Route path="tours" element={<Navigate to="/packages" replace />} />
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                </Route>

                <Route path="/login" element={<Login />} />

                {/* Admin Routes using AdminLayout (Sidebar/Topbar) */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="bookings" element={<Bookings />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="vendors" element={<Vendors />} />
                  <Route path="itinerary-builder" element={<ItineraryBuilder />} />
                  <Route path="accounts" element={<AdminAccounts />} />
                  <Route path="leads" element={<AdminLeads />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="staff" element={<StaffManagement />} />
                  <Route path="packages" element={<AdminPackages />} />
                  <Route path="masters" element={<Masters />} />
                  <Route path="*" element={<div className="p-10">Page Under Construction</div>} />
                </Route>

                {/* Fallback for unknown routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </HashRouter>
        </DataProvider>
      </MasterDataProvider>
    </AuthProvider>
  );
};

export default App;
