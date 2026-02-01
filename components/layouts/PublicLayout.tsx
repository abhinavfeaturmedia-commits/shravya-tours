import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { PillNav, PillNavItem } from '../ui/PillNav';
import { UrgencyNotification } from '../ui/UrgencyNotification';

export const PublicLayout: React.FC = () => {
  const location = useLocation();

  const navItems: PillNavItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Destinations', href: '/packages' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Staff', href: '/admin' },
  ];

  const handlePlaceholder = (e: React.MouseEvent, label: string) => {
    e.preventDefault();
    alert(`${label} page is coming soon!`);
  };

  const handleSocialClick = (platform: string) => {
    alert(`Redirecting to ${platform} profile...`);
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background-light dark:bg-slate-950 selection:bg-primary/30 text-slate-900 dark:text-slate-100">
      <UrgencyNotification />

      {/* Floating Navigation */}
      <div className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto w-full flex justify-center">
          <PillNav
            logo={<span className="material-symbols-outlined text-[20px] text-primary">travel_explore</span>}
            logoAlt="Shravya Tours"
            items={navItems}
            activeHref={location.pathname}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 pt-20 border-t border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-6 lg:px-10 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-6 group">
                <span className="material-symbols-outlined text-primary text-4xl transition-transform duration-500 group-hover:rotate-12">travel_explore</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Shravya</span>
              </Link>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8 text-sm">
                Your journey begins with a single click. Trusted by 50,000+ travelers worldwide to deliver unforgettable experiences.
              </p>
              <div className="flex gap-3">
                {['facebook', 'instagram', 'twitter'].map(social => (
                  <button
                    key={social}
                    onClick={() => handleSocialClick(social)}
                    className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all transform hover:scale-110"
                  >
                    <span className="material-symbols-outlined text-[18px]">public</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase text-xs tracking-[0.2em]">Company</h4>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
                <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><button onClick={(e) => handlePlaceholder(e, 'Careers')} className="hover:text-primary transition-colors">Careers</button></li>
                <li><button onClick={(e) => handlePlaceholder(e, 'Blog')} className="hover:text-primary transition-colors">Blog</button></li>
                <li><button onClick={(e) => handlePlaceholder(e, 'Press')} className="hover:text-primary transition-colors">Press</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase text-xs tracking-[0.2em]">Support</h4>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
                <li><Link to="/contact" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><button onClick={(e) => handlePlaceholder(e, 'Terms of Service')} className="hover:text-primary transition-colors">Terms of Service</button></li>
                <li><button onClick={(e) => handlePlaceholder(e, 'Privacy Policy')} className="hover:text-primary transition-colors">Privacy Policy</button></li>
                <li><button onClick={(e) => handlePlaceholder(e, 'Refund Policy')} className="hover:text-primary transition-colors">Refund Policy</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase text-xs tracking-[0.2em]">Contact</h4>
              <div className="space-y-4 text-slate-500 dark:text-slate-400 text-sm font-medium">
                <a href="mailto:toursshravya@gmail.com" className="flex items-center gap-3 hover:text-primary transition-colors"><span className="material-symbols-outlined text-primary text-[20px]">mail</span> toursshravya@gmail.com</a>
                <a href="tel:8010955675" className="flex items-center gap-3 hover:text-primary transition-colors"><span className="material-symbols-outlined text-primary text-[20px]">call</span> 80109 55675</a>
                <p className="flex items-center gap-3"><span className="material-symbols-outlined text-primary text-[20px]">location_on</span> Pune, Maharashtra</p>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-400">
            <p>© 2025 Shravya Tours Pvt Ltd. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/admin" className="hover:text-slate-900 dark:hover:text-white transition-colors">Staff Portal</Link>
              <button onClick={(e) => handlePlaceholder(e, 'Sitemap')} className="hover:text-slate-900 dark:hover:text-white transition-colors">Sitemap</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};