
export enum UserRole {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
  AGENT = 'AGENT'
}

export enum BookingStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  CANCELLED = 'Cancelled',
  COMPLETED = 'Completed'
}

export type BookingType = 'Tour' | 'Hotel' | 'Car' | 'Bus';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Package {
  id: string;
  title: string;
  days: number;
  groupSize: string;
  location: string;
  description: string;
  price: number;
  image: string;
  tag?: string;
  tagColor?: string;
  theme: string;
  rating: string;
  reviews: string;
  overview: string;
  highlights: { icon: string; label: string }[];
  itinerary: { day: number; title: string; desc: string }[];
  gallery: string[];
  status?: 'Active' | 'Inactive';
  remainingSeats?: number;
  offerEndTime?: string; // ISO String for countdown
}

export interface Booking {
  id: string;
  type: BookingType;
  customer: string;
  email: string;
  phone?: string;
  title: string;
  date: string;
  amount: number;
  guests?: string;
  status: BookingStatus;
  payment: 'Paid' | 'Unpaid' | 'Deposit' | 'Refunded';
  details?: string;
  packageId?: string;
}

export interface LeadLog {
  id: string;
  type: 'Note' | 'Call' | 'Email' | 'Quote' | 'System' | 'WhatsApp';
  content: string;
  timestamp: string; // ISO String
}



export interface AuditLog {
  id: string;
  action: string; // e.g., "Deleted Lead", "Updated Staff"
  module: string; // e.g., "Leads", "Staff", "Finance"
  performedBy: string; // User Name
  details: string;
  timestamp: string;
  severity: 'Info' | 'Warning' | 'Critical';
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  destination: string;
  startDate?: string;
  travelers: string;
  budget: string;
  type: string;
  status: 'New' | 'Warm' | 'Hot' | 'Cold' | 'Offer Sent' | 'Converted';
  priority: 'High' | 'Medium' | 'Low';
  potentialValue: number;
  addedOn: string;
  source: string;
  preferences?: string;
  logs: LeadLog[];
  avatarColor?: string;
  assignedTo?: number; // Staff ID
  whatsapp?: string; // WhatsApp Number
  isWhatsappSame?: boolean;
  aiScore?: number; // 0-100
  aiSummary?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location?: string;
  type: 'New' | 'Returning' | 'VIP';
  status: 'Active' | 'Inactive';
  totalSpent: number;
  bookingsCount: number;
  joinedDate: string;
  tags?: string[];
  lastActive?: string;
}




export interface StaffModulePermissions {
  view: boolean;
  manage: boolean;
}

export interface StaffPermissions {
  transfer: StaffModulePermissions;
  dayItinerary: StaffModulePermissions;
  destinations: StaffModulePermissions;
  roomType: StaffModulePermissions;
  mealPlan: StaffModulePermissions;
  leadSource: StaffModulePermissions;
  expenseType: StaffModulePermissions;
  packageTheme: StaffModulePermissions;
  currency: StaffModulePermissions;
}

export interface StaffMember {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  userType: 'Staff' | 'Admin';
  department: string;
  status: 'Active' | 'Inactive';
  lastActive: string;
  initials: string;
  color: string;
  currentSessionId?: string; // For single session enforcement
  permissions?: StaffPermissions;
  queryScope?: 'Show Assigned Query Only' | 'Show All Queries';
  whatsappScope?: 'Assigned Queries Messages' | 'All Messages';
}

export interface DailySlot {
  date: number;
  capacity: number;
  booked: number;
  price: number;
  isBlocked: boolean;
}

export interface VendorService {
  id: string;
  name: string;
  unit: string;
  baseCost: number;
  markupType: 'Percentage' | 'Fixed';
  markupValue: number;
  sellingPrice: number;
  status: 'Active' | 'Inactive';
}

export interface VendorDocument {
  id: string;
  name: string;
  type: 'Contract' | 'License' | 'ID' | 'Insurance' | 'Other';
  expiryDate?: string;
  url: string;
  status: 'Valid' | 'Expired' | 'Pending';
  uploadDate: string;
}

export interface VendorTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'Credit' | 'Debit';
  reference?: string;
}

export interface VendorNote {
  id: string;
  text: string;
  date: string;
  author: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: 'Hotel' | 'Transport' | 'Guide' | 'Activity';
  location: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  rating: number;
  contractStatus: 'Active' | 'Expiring' | 'Reviewing' | 'Blacklisted';
  contractExpiryDate?: string;
  logo: string;

  totalSales: number;
  totalCommission: number;
  balanceDue: number;

  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    ifsc: string;
    upiId?: string;
    upiNumber?: string;
  };

  services: VendorService[];
  documents: VendorDocument[];
  transactions: VendorTransaction[];
  notes: VendorNote[];
}

// --- New Features Types ---

export interface AccountTransaction {
  id: string;
  date: string;
  type: 'Credit' | 'Debit';
  amount: number;
  description: string;
  reference?: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'Agent' | 'Corporate';
  companyName: string;
  email: string;
  phone: string;
  location: string;
  currentBalance: number; // Wallet Balance (Positive = Funds Available)
  status: 'Active' | 'Inactive' | 'Blocked';
  logo: string;
  transactions: AccountTransaction[];
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'User' | 'System' | 'Lead';
  timestamp: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'Email' | 'WhatsApp' | 'SMS';
  audience: 'Leads' | 'Customers' | 'Agents';
  status: 'Draft' | 'Scheduled' | 'Sent';
  metrics: {
    sent: number;
    opened: number;
    clicked: number;
  };
}

// --- Master Data Types ---

export type MasterLocationType = 'City' | 'State' | 'Country';

export interface MasterLocation {
  id: string;
  name: string;
  type: MasterLocationType;
  region: string;
  image?: string;
  status: 'Active' | 'Inactive';
}

export interface MasterHotel {
  id: string;
  name: string;
  locationId: string;
  rating: number;
  amenities: string[];
  pricePerNight: number;
  image?: string;
  status: 'Active' | 'Inactive';
}

export interface MasterActivity {
  id: string;
  name: string;
  locationId: string;
  duration: string;
  cost: number;
  category: 'Sightseeing' | 'Adventure' | 'Cultural' | 'Leisure' | 'Other';
  image?: string;
  status: 'Active' | 'Inactive';
}

export type MasterTransportType = 'Sedan' | 'SUV' | 'Hatchback' | 'Bus' | 'Tempo Traveller' | 'Train' | 'Flight';

export interface MasterTransport {
  id: string;
  name: string;
  type: MasterTransportType;
  capacity: number;
  baseRate: number;
  image?: string;
  status: 'Active' | 'Inactive';
}

export interface MasterPlanDay {
  day: number;
  title: string;
  activities: string[];
  hotelId?: string;
  transportId?: string;
}

export interface MasterPlan {
  id: string;
  title: string;
  duration: number;
  locationId: string;
  days: MasterPlanDay[];
  estimatedCost: number;
  status: 'Active' | 'Draft';
}
