
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../src/lib/api';
import { toast } from 'sonner';
import { Package, Booking, BookingStatus, DailySlot, Lead, LeadLog, Vendor, VendorDocument, VendorTransaction, VendorNote, Account, AccountTransaction, Campaign } from '../types';

// Storage helpers
const STORAGE_KEY = 'shravya_data';

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = <T,>(key: string, data: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
};

// Helper to get offset dates
const getFutureDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const getPastDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

const getISOString = (daysOffset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString();
};

// Initial Mock Data
const INITIAL_PACKAGES: Package[] = [
  {
    id: 'kerala-backwaters',
    title: 'Kerala Backwaters',
    days: 4,
    groupSize: 'Family',
    location: 'Kerala, India',
    description: 'Relax on a houseboat cruise through the tranquil backwaters of Alleppey and Kumarakom.',
    price: 28000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBp90RDz-sdjWIaMxCiFRFPO2JsAtK8_dVyOrgkjVXU2eyOfv-QVT0aL8P898Icc29bRifPA2obAWYdG2DUFAu34TSsNNv6AEBb3PkvvVLUy7SiHFhxeAmVHy5JBvY1y3-aVD3CNyS4GknQTya93LHTeT3z7AdLkm9WnOOCJCJKFhwsg0FzrktdLVdl7GvmF40ru8MoKKDLDCnEKa5pwANUTQwYGofMrr6hkRstcsuxW0zFPZrgXEepwClL91yq119GbnN_2TXDnS-4',
    tag: 'Early Bird Offer',
    tagColor: 'bg-green-500 text-white',
    theme: 'Family',
    rating: '4.9',
    reviews: '1,240',
    overview: 'Experience "God\'s Own Country" with this immersive tour.',
    highlights: [{ icon: 'directions_boat', label: 'Houseboat' }, { icon: 'eco', label: 'Tea Gardens' }],
    itinerary: [{ day: 1, title: 'Arrival', desc: 'Arrive in Kochi.' }],
    gallery: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBp90RDz-sdjWIaMxCiFRFPO2JsAtK8_dVyOrgkjVXU2eyOfv-QVT0aL8P898Icc29bRifPA2obAWYdG2DUFAu34TSsNNv6AEBb3PkvvVLUy7SiHFhxeAmVHy5JBvY1y3-aVD3CNyS4GknQTya93LHTeT3z7AdLkm9WnOOCJCJKFhwsg0FzrktdLVdl7GvmF40ru8MoKKDLDCnEKa5pwANUTQwYGofMrr6hkRstcsuxW0zFPZrgXEepwClL91yq119GbnN_2TXDnS-4'],
    status: 'Active',
    remainingSeats: 4,
    offerEndTime: getISOString(2)
  },
  {
    id: 'manali-escape',
    title: 'Majestic Manali Escape',
    days: 5,
    groupSize: 'Max 10',
    location: 'Manali, India',
    description: 'Experience the breathtaking valleys and serene landscapes of the Himalayas.',
    price: 35000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw3nTyyZIHE-X4IDz1WIxoLShlt4crH7NAqMA0V0L2ehFuGP9AGiAolK-y2VtcGXQNnGxdEkuHTXyJ44x9J5RiIg5apuiNJV-7xi5I2UV2r-KSd-dgzrATQDbBkFz4UKlFbdF5SgirAYanpbXenNDr-_uktTK_A2FTmUBwhVLQfYFh1gqRN8EoLj-9g8qrA6B21OH52wai00ETSdEUNm2LJQX1poTztcNfmmE2IMrm1oTdfTQ3Sg0DwMSXi2UM_QPDWQt27m2xr8-D',
    tag: 'Best Seller',
    tagColor: 'bg-yellow-400 text-yellow-950',
    theme: 'Adventure',
    rating: '4.8',
    reviews: '950',
    overview: 'Escape the heat and dive into the snowy wonder of Manali.',
    highlights: [{ icon: 'snowboarding', label: 'Solang Valley' }],
    itinerary: [{ day: 1, title: 'Reach Manali', desc: 'Check into hotel.' }],
    gallery: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCw3nTyyZIHE-X4IDz1WIxoLShlt4crH7NAqMA0V0L2ehFuGP9AGiAolK-y2VtcGXQNnGxdEkuHTXyJ44x9J5RiIg5apuiNJV-7xi5I2UV2r-KSd-dgzrATQDbBkFz4UKlFbdF5SgirAYanpbXenNDr-_uktTK_A2FTmUBwhVLQfYFh1gqRN8EoLj-9g8qrA6B21OH52wai00ETSdEUNm2LJQX1poTztcNfmmE2IMrm1oTdfTQ3Sg0DwMSXi2UM_QPDWQt27m2xr8-D'],
    status: 'Active',
    remainingSeats: 2,
    offerEndTime: getISOString(1)
  },
  {
    id: 'golden-triangle',
    title: 'Golden Triangle Tour',
    days: 6,
    groupSize: 'Max 15',
    location: 'North India',
    description: 'Explore Delhi, Agra and Jaipur - the iconic Golden Triangle of India.',
    price: 45000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDe8BDAUta_Sad0sbfFPp3eGFuTDne-kjCHaSbEmPIsw2A35eYa_4cmO0qQIrrAUnyuBkmJYYx5BswvQ8xoNvi-V48GV78qtY2osp3mRT5dAgVv31-tcAdYZIYq5VwnghdHN-xLMZHlH8DhevC9MvU-RUVOzTxENfRuR9CornjT44jfRzEHiuwDi6on6RQISv-Sa7xPzXf6U61FblGpi9Ou2aXfsR5_PoyNJhX-aCt1zuv1ogRgtmIOXqYjfcAQ79z48VNTNX3nLemm',
    tag: 'Most Popular',
    tagColor: 'bg-purple-500 text-white',
    theme: 'Cultural',
    rating: '5.0',
    reviews: '2,100',
    overview: 'A journey through history, culture and architectural wonders.',
    highlights: [{ icon: 'temple_buddhist', label: 'Taj Mahal' }, { icon: 'fort', label: 'Amer Fort' }],
    itinerary: [{ day: 1, title: 'Delhi', desc: 'Explore Old Delhi.' }],
    gallery: [],
    status: 'Active',
    remainingSeats: 8,
  },
  {
    id: 'ladakh-adventure',
    title: 'Leh Ladakh Adventure',
    days: 8,
    groupSize: 'Max 12',
    location: 'Ladakh, India',
    description: 'An epic journey through the highest motorable roads in the world.',
    price: 65000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpQiwfKH0yIRycIB8I2oEBy84i-Io3CIha3W5YAJfjpY1Jghiz6KZm9ugQVQh2w1iYR3smMg-3cpUXS07wl7wtOG7tMr-mD3U-5wbABd_2KyTx6jhq4cZAZVjMPjbUU1yxD4LrltucSAO-ZFLoA_ccgWlKW0wsSVrrkrWiCVwGsI8quL38dPZQOPDjQJbUiojqsqXyVKEnZ2jpVDbJw0GE7jrTbRPihr9RoDuW21hmKXYHaB52a6heuHbI7htXFMkWjCPab-3djC20',
    tag: 'Adventure',
    tagColor: 'bg-orange-500 text-white',
    theme: 'Adventure',
    rating: '4.7',
    reviews: '780',
    overview: 'Experience the raw beauty of the Himalayas.',
    highlights: [{ icon: 'landscape', label: 'Pangong Lake' }, { icon: 'two_wheeler', label: 'Bike Ride' }],
    itinerary: [{ day: 1, title: 'Leh Arrival', desc: 'Acclimatization day.' }],
    gallery: [],
    status: 'Active',
    remainingSeats: 5,
  }
];

const INITIAL_BOOKINGS: Booking[] = [
  { id: '#BK-9001', type: 'Tour', customer: 'Rahul Verma', email: 'rahul@example.com', packageId: 'kerala-backwaters', title: 'Kerala Backwaters', date: getFutureDate(5), amount: 28000, status: BookingStatus.CONFIRMED, payment: 'Paid', guests: '2 Adults' },
  { id: '#BK-9002', type: 'Tour', customer: 'Sarah Jenkins', email: 'sarah.j@uk.co', packageId: 'golden-triangle', title: 'Golden Triangle Tour', date: getFutureDate(12), amount: 45000, status: BookingStatus.PENDING, payment: 'Unpaid', guests: '1 Adult' },
  { id: '#BK-8821', type: 'Car', customer: 'Raj Travels & Co.', email: 'agent.raj@example.com', title: 'Innova Rental - Goa', date: getPastDate(15), amount: 25000, status: BookingStatus.COMPLETED, payment: 'Paid', guests: '4 Adults', details: 'Client: Mr. Sharma' },
];

const INITIAL_LEADS: Lead[] = [
  {
    id: 'LD-401',
    name: 'Rahul Sharma',
    email: 'rahul.s@example.com',
    phone: '+91 98765 12345',
    destination: 'Bali, Indonesia',
    type: 'Family Trip',
    status: 'Warm',
    priority: 'Medium',
    potentialValue: 45000,
    addedOn: getISOString(-2),
    travelers: '2 Adults, 1 Child',
    budget: '₹40,000 - ₹50,000',
    source: 'Website',
    avatarColor: 'bg-blue-100 text-blue-600',
    logs: [
      { id: '1', type: 'System', content: 'Lead created via Website', timestamp: getISOString(-2) }
    ]
  },
  {
    id: 'LD-402',
    name: 'Ananya Mehta',
    email: 'ananya.m@example.com',
    phone: '+91 99887 66554',
    destination: 'Paris, France',
    type: 'Honeymoon',
    status: 'Hot',
    priority: 'High',
    potentialValue: 150000,
    addedOn: getISOString(-1),
    travelers: '2 Adults',
    budget: '₹1,50,000+',
    source: 'Instagram',
    avatarColor: 'bg-purple-100 text-purple-600',
    logs: []
  },
  {
    id: 'LD-403',
    name: 'David Kim',
    email: 'david.k@example.com',
    phone: '+1 202 555 0199',
    destination: 'Kyoto, Japan',
    type: 'Cultural Tour',
    status: 'Offer Sent',
    priority: 'High',
    potentialValue: 120000,
    addedOn: getISOString(-5),
    travelers: '2 Adults, 1 Child',
    budget: '₹1,00,000 - ₹1,50,000',
    source: 'Referral',
    preferences: 'Interested in 5-star ryokans, vegetarian food options required for all meals. Wants a tea ceremony experience.',
    avatarColor: 'bg-indigo-100 text-indigo-600',
    logs: [
      { id: 'l1', type: 'Quote', content: 'Sent the "Japan Cultural Immersion" itinerary V2.', timestamp: getISOString(-4) },
      { id: 'l2', type: 'Call', content: 'Client asked for hotel upgrades in Kyoto. Adjusted budget.', timestamp: getISOString(-5) }
    ]
  }
];

const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'VND-001',
    name: 'Ocean View Resort',
    category: 'Hotel',
    location: 'Goa, India',
    contactName: 'Rajesh Kumar',
    contactPhone: '+91 98765 43210',
    contactEmail: 'reservations@oceanview.com',
    rating: 4.8,
    contractStatus: 'Active',
    contractExpiryDate: '2025-12-31',
    logo: 'https://placehold.co/100x100/3b82f6/ffffff?text=OVR',
    totalSales: 1500000,
    totalCommission: 225000,
    balanceDue: 45000,
    bankDetails: { accountName: 'Ocean View Hospitality', accountNumber: '9876543210', bankName: 'HDFC Bank', ifsc: 'HDFC0001234' },
    services: [
      { id: 'S1', name: 'Deluxe Room', unit: 'Per Night', baseCost: 3500, markupType: 'Percentage', markupValue: 15, sellingPrice: 4025, status: 'Active' },
      { id: 'S2', name: 'Airport Pickup', unit: 'Per Trip', baseCost: 1200, markupType: 'Fixed', markupValue: 500, sellingPrice: 1700, status: 'Active' }
    ],
    documents: [
      { id: 'D1', name: 'Service Agreement', type: 'Contract', expiryDate: '2025-12-31', url: '#', status: 'Valid', uploadDate: '2024-01-01' },
    ],
    transactions: [
      { id: 'TX-101', date: getPastDate(2), description: 'Booking Commission (Ocean View)', amount: 4500, type: 'Credit' },
      { id: 'TX-99', date: getPastDate(7), description: 'Payout - Weekly Settlement', amount: 25000, type: 'Debit', reference: 'UTR-889977' }
    ],
    notes: [
      { id: 'N1', text: 'Negotiated 15% commission for Q4 2025.', date: getPastDate(10), author: 'Alice Johnson' }
    ]
  },
  {
    id: 'VND-024',
    name: 'City Cabs Premium',
    category: 'Transport',
    location: 'Mumbai, India',
    contactName: 'Suresh Menon',
    contactPhone: '+91 91234 56789',
    contactEmail: 'suresh@citycabs.in',
    rating: 4.2,
    contractStatus: 'Active',
    contractExpiryDate: '2026-06-30',
    logo: 'https://placehold.co/100x100/1e293b/ffffff?text=CCP',
    totalSales: 450000,
    totalCommission: 90000,
    balanceDue: 12000,
    bankDetails: { accountName: 'City Cabs Pvt Ltd', accountNumber: '1122334455', bankName: 'ICICI Bank', ifsc: 'ICIC0000555' },
    services: [
      { id: 'S3', name: 'Innova Crysta (8Hr)', unit: 'Per Day', baseCost: 4000, markupType: 'Fixed', markupValue: 800, sellingPrice: 4800, status: 'Active' },
    ],
    documents: [],
    transactions: [],
    notes: []
  }
];

const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'ACC-001',
    name: 'Raj Travels',
    type: 'Agent',
    companyName: 'Raj Travels & Co.',
    email: 'agent.raj@example.com',
    phone: '+91 98989 89898',
    location: 'Delhi',
    currentBalance: 5000,
    status: 'Active',
    logo: 'https://placehold.co/100x100/orange/white?text=RT',
    transactions: [
      { id: 'TX-A1', date: getPastDate(2), type: 'Credit', amount: 50000, description: 'Wallet Top-up', reference: 'UTR-998877' },
      { id: 'TX-A2', date: getPastDate(1), type: 'Debit', amount: 45000, description: 'Booking #BK-9002 (Golden Triangle)' }
    ]
  },
  {
    id: 'ACC-002',
    name: 'Tech Solutions Inc',
    type: 'Corporate',
    companyName: 'Tech Solutions Inc',
    email: 'admin@techsol.com',
    phone: '+91 22 2400 1234',
    location: 'Bangalore',
    currentBalance: 0,
    status: 'Active',
    logo: 'https://placehold.co/100x100/blue/white?text=TS',
    transactions: []
  }
];

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'CMP-001',
    name: 'Summer Sale 2025',
    type: 'Email',
    audience: 'Leads',
    status: 'Sent',
    metrics: { sent: 1200, opened: 450, clicked: 120 }
  },
  {
    id: 'CMP-002',
    name: 'Diwali Special Offers',
    type: 'WhatsApp',
    audience: 'Customers',
    status: 'Scheduled',
    metrics: { sent: 0, opened: 0, clicked: 0 }
  }
];

interface DataContextType {
  packages: Package[];
  bookings: Booking[];
  leads: Lead[];
  inventory: Record<number, DailySlot>;
  vendors: Vendor[];
  accounts: Account[];
  campaigns: Campaign[];
  // Package Functions
  addPackage: (pkg: Package) => void;
  updatePackage: (id: string, pkg: Partial<Package>) => void;
  deletePackage: (id: string) => void;
  // Booking Functions
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, booking: Partial<Booking>) => void;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  deleteBooking: (id: string) => void;
  // Lead Functions
  addLead: (lead: Lead) => void;
  updateLead: (id: string, lead: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  addLeadLog: (id: string, log: LeadLog) => void;
  // Inventory
  updateInventory: (date: number, slot: DailySlot) => void;
  getRevenue: () => number;
  // Vendor Functions
  addVendor: (vendor: Vendor) => void;
  updateVendor: (id: string, vendor: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;
  processVendorPayment: (vendorId: string, amount: number, reference: string) => void;
  addVendorDocument: (vendorId: string, doc: VendorDocument) => void;
  deleteVendorDocument: (vendorId: string, docId: string) => void;
  addVendorNote: (vendorId: string, note: VendorNote) => void;
  // Account Functions
  addAccount: (acc: Account) => void;
  updateAccount: (id: string, acc: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addAccountTransaction: (accountId: string, tx: AccountTransaction) => void;
  // Campaign Functions
  addCampaign: (campaign: Campaign) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use API for core business data
  const [packages, setPackages] = useState<Package[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  // Keep Mock/Local for secondary features (Vendors, Accounts, Campaigns)
  const [vendors, setVendors] = useState<Vendor[]>(() =>
    loadFromStorage(`${STORAGE_KEY}_vendors`, INITIAL_VENDORS)
  );
  const [accounts, setAccounts] = useState<Account[]>(() =>
    loadFromStorage(`${STORAGE_KEY}_accounts`, INITIAL_ACCOUNTS)
  );
  const [campaigns, setCampaigns] = useState<Campaign[]>(() =>
    loadFromStorage(`${STORAGE_KEY}_campaigns`, INITIAL_CAMPAIGNS)
  );

  // Initialize Inventory State - Dynamic for Current Month (Mock)
  const [inventory, setInventory] = useState<Record<number, DailySlot>>(() => {
    const saved = loadFromStorage<Record<number, DailySlot> | null>(`${STORAGE_KEY}_inventory`, null);
    if (saved) return saved;

    const initialInv: Record<number, DailySlot> = {};
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const booked = Math.floor(Math.random() * 3);
      initialInv[i] = { date: i, capacity: 20, booked, price: 35000, isBlocked: false };
    }
    return initialInv;
  });

  // Load Real Data from Supabase
  useEffect(() => {
    const loadRealData = async () => {
      try {
        const [p, b, l, v, a, i] = await Promise.all([
          api.getPackages(),
          api.getBookings(),
          api.getLeads(),
          api.getVendors(),
          api.getAccounts(),
          api.getInventory()
        ]);
        setPackages(p);
        setBookings(b);
        setLeads(l);
        setVendors(v);
        setAccounts(a);

        // Merge DB inventory into state
        if (i && Object.keys(i).length > 0) {
          setInventory(prev => ({ ...prev, ...i }));
        }
      } catch (e) {
        console.error("Failed to load Supabase data.", e);
        toast.error("Failed to load data. Please check connection.");
      }
    };
    loadRealData();
  }, []);

  // Persist only minimal secondary data or cache
  useEffect(() => { saveToStorage(`${STORAGE_KEY}_campaigns`, campaigns); }, [campaigns]);


  // Package CRUD
  const addPackage = useCallback(async (pkg: Package) => {
    try {
      const newPkg = await api.createPackage(pkg);
      setPackages(prev => [newPkg, ...prev]);
    } catch (e) { console.error("Add Package Failed", e); }
  }, []);

  const updatePackage = useCallback(async (id: string, updated: Partial<Package>) => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    try { await api.updatePackage(id, updated); } catch (e) { console.error(e); }
  }, []);

  const deletePackage = useCallback((id: string) => {
    setPackages(prev => prev.filter(p => p.id !== id));
  }, []);

  // Booking CRUD
  const addBooking = useCallback(async (booking: Booking) => {
    // Optimistic Update
    setBookings(prev => [booking, ...prev]);

    try {
      await api.createBooking(booking);

      // Update Daily Slot Inventory (Real Logic)
      const bDate = new Date(booking.date);
      const day = bDate.getDate();
      const dateStr = bDate.toISOString().split('T')[0];

      // Optimistic Update
      setInventory(prev => ({
        ...prev,
        [day]: { ...prev[day], booked: (prev[day]?.booked || 0) + 1 }
      }));

      // Server Update
      await api.updateInventory(dateStr, { booked: (inventory[day]?.booked || 0) + 1 });


      // Update Specific Package Inventory (Real DB Sync)
      if (booking.packageId) {
        const pkg = packages.find(p => p.id === booking.packageId);
        if (pkg && (pkg.remainingSeats !== undefined)) {
          const newSeats = Math.max(0, pkg.remainingSeats - 1);
          // Update Local
          setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, remainingSeats: newSeats } : p));
          // Update DB
          await api.updatePackage(pkg.id, { remainingSeats: newSeats });
        }
      }
      toast.success("Booking created successfully!");
    } catch (e) {
      console.error("Add Booking Failed", e);
      toast.error("Failed to create booking.");
      // Rollback (Simplistic)
      setBookings(prev => prev.filter(b => b.id !== booking.id));
    }
  }, [packages]);

  const updateBooking = useCallback((id: string, updated: Partial<Booking>) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updated } : b));
  }, []);

  const updateBookingStatus = useCallback(async (id: string, status: BookingStatus) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    try { await api.updateBookingStatus(id, status); } catch (e) { console.error(e); }
  }, []);

  const deleteBooking = useCallback((id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
  }, []);

  // Lead CRUD
  const addLead = useCallback(async (lead: Lead) => {
    setLeads(prev => [lead, ...prev]);
    try { await api.createLead(lead); } catch (e) { console.error(e); }
  }, []);

  const updateLead = useCallback((id: string, updated: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updated } : l));
  }, []);

  const deleteLead = useCallback((id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  }, []);

  const addLeadLog = useCallback((id: string, log: LeadLog) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, logs: [log, ...l.logs] } : l));
  }, []);

  // Inventory
  const updateInventory = useCallback((date: number, slot: DailySlot) => {
    setInventory(prev => ({ ...prev, [date]: slot }));
  }, []);


  const getRevenue = useCallback(() => bookings.reduce((acc, curr) => {
    if (curr.payment === 'Paid') {
      return acc + curr.amount;
    }
    return acc;
  }, 0), [bookings]);

  // Vendor CRUD
  const addVendor = useCallback(async (vendor: Vendor) => {
    setVendors(prev => [vendor, ...prev]);
    try {
      await api.createVendor(vendor);
      toast.success("Vendor added.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save vendor.");
    }
  }, []);
  const updateVendor = useCallback((id: string, updated: Partial<Vendor>) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, ...updated } : v));
  }, []);
  const deleteVendor = useCallback((id: string) => setVendors(prev => prev.filter(v => v.id !== id)), []);

  const processVendorPayment = useCallback((vendorId: string, amount: number, reference: string) => {
    setVendors(prev => prev.map(v => {
      if (v.id === vendorId) {
        const newTransaction: VendorTransaction = {
          id: `TX-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          description: 'Manual Payout',
          amount: amount,
          type: 'Debit',
          reference
        };
        return {
          ...v,
          balanceDue: v.balanceDue - amount,
          transactions: [newTransaction, ...v.transactions]
        };
      }
      return v;
    }));
  }, []);

  const addVendorDocument = useCallback((vendorId: string, doc: VendorDocument) => {
    setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, documents: [...v.documents, doc] } : v));
  }, []);

  const deleteVendorDocument = useCallback((vendorId: string, docId: string) => {
    setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, documents: v.documents.filter(d => d.id !== docId) } : v));
  }, []);

  const addVendorNote = useCallback((vendorId: string, note: VendorNote) => {
    setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, notes: [note, ...v.notes] } : v));
  }, []);

  // Account CRUD
  const addAccount = useCallback(async (acc: Account) => {
    setAccounts(prev => [...prev, acc]);
    try {
      await api.createAccount(acc);
      toast.success("Account added.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save account.");
    }
  }, []);
  const updateAccount = useCallback((id: string, updated: Partial<Account>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
  }, []);
  const deleteAccount = useCallback((id: string) => setAccounts(prev => prev.filter(a => a.id !== id)), []);

  const addAccountTransaction = useCallback((accountId: string, tx: AccountTransaction) => {
    setAccounts(prev => prev.map(a => {
      if (a.id === accountId) {
        const newBalance = tx.type === 'Credit'
          ? a.currentBalance + tx.amount
          : a.currentBalance - tx.amount;
        return {
          ...a,
          currentBalance: newBalance,
          transactions: [tx, ...a.transactions]
        };
      }
      return a;
    }));
  }, []);

  // Campaign
  const addCampaign = useCallback((campaign: Campaign) => {
    setCampaigns(prev => [campaign, ...prev]);
  }, []);

  const value = useMemo(() => ({
    packages, bookings, leads, inventory, vendors, accounts, campaigns,
    addPackage, updatePackage, deletePackage,
    addBooking, updateBooking, updateBookingStatus, deleteBooking,
    addLead, updateLead, deleteLead, addLeadLog,
    updateInventory, getRevenue,
    addVendor, updateVendor, deleteVendor,
    processVendorPayment, addVendorDocument, deleteVendorDocument,
    addVendorNote,
    addAccount, updateAccount, deleteAccount, addAccountTransaction,
    addCampaign,
  }), [
    packages, bookings, leads, inventory, vendors, accounts, campaigns,
    addPackage, updatePackage, deletePackage,
    addBooking, updateBooking, updateBookingStatus, deleteBooking,
    addLead, updateLead, deleteLead, addLeadLog,
    updateInventory, getRevenue,
    addVendor, updateVendor, deleteVendor,
    processVendorPayment, addVendorDocument, deleteVendorDocument,
    addVendorNote,
    addAccount, updateAccount, deleteAccount, addAccountTransaction,
    addCampaign,
  ]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
