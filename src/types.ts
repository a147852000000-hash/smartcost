export type Language = "ar" | "en" | "fr";
export type CertificateProfitFrequency = "monthly" | "quarterly" | "semiannual" | "annual" | "maturity";
export type PaymentMethod = "cash" | "card" | "wallet" | "unknown";
export type ExpenseCategoryType = string;

export interface Expense {
  id:string; title:string; amount:number; category:ExpenseCategoryType; date:string;
  paymentMethod:PaymentMethod; receiptUrl?:string; notes?:string; createdAt:string;
}
export interface BudgetSummary { totalBudget:number; totalExpenses:number; remaining:number; percentUsed:number; }
export interface IncomeSourceItem {
  id:string; source:string; amount:number; date:string; type:string; notes?:string; createdAt:string;
}
export interface MonthlyIncome {
  id:string; month:string; salary:number; bonuses:number; otherIncome:number; otherIncomeNote?:string;
  sources?:IncomeSourceItem[]; createdAt:string; updatedAt?:string;
}
export interface BankCertificate {
  id:string; bankName:string; certificateNumber?:string; duration:string; amount:number;
  annualRate?:number; annualProfit?:number; periodicProfit?:number; monthlyEquivalentProfit?:number;
  returnType?:"simple"|"compound"|"variable"; issueDate:string; maturityDate:string; profitDate:string;
  profitAmount:number; profitFrequency:CertificateProfitFrequency; notes?:string; createdAt:string; updatedAt?:string;
}
export interface VehicleAccidentRecord {
  id:string; vehicleId?:string; title:string; photoUrl:string; date:string; time:string; location?:string;
  estimatedDamage?:number; notes?:string; createdAt:string;
}
export interface StudentProfile { id:string; name:string; studentReference?:string; age:string; stage:string; }
export interface StudentExpenseRecord {
  id:string; studentId:string; subCategory:"lessons"|"personal"|"transport"|"school"|"books";
  title:string; amount:number; date:string;
}
export interface MedicalExpenseRecord {
  id:string; familyMember:string; facilityName?:string;
  facilityType:"مستشفى"|"عيادة خاصة"|"عيادة أسنان"|"صيدلية"|"أخرى";
  conditionDescription:string; doctorDiagnosis?:string; examinationCost:number; medicationCost:number;
  date:string; notes?:string;
}
export interface CarTripIncomeRecord {
  id:string; tripNumber:string|number; amount:number; date:string; dayName?:string; time?:string;
  notes?:string; tripType?:string; paymentMethod?:string; createdAt:string;
}
export interface UserProfile {
  vehiclePreferences?: { vehicleType?:string; primaryVehicleName?:string; vehicleShape?:string };
}


// Chat types migrated from SMART-TIME for unified preview.
export interface ChatRoom {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  type: 'public' | 'direct' | 'group';
  avatar: string;
  creatorId?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  membersCount?: number;
  isOnline?: boolean;
  background?: string;
  backgroundUrl?: string;
  avatarUrl?: string;
  members?: ChatMember[];
  permissions?: ChatRoomPermissions;
  adminPermissions?: ChatRoomPermissions;
  moderatorPermissions?: ChatRoomPermissions;
  settings?: ChatRoomSettings;
  inviteLink?: string;
  pinned?: boolean;
  currentUserRole?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  roomId?: string;
  conversationId?: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  body?: string;
  mediaUrl?: string;
  type?: 'text' | 'image' | 'video' | 'voice' | 'file' | 'location' | 'poll';
  status?: 'sent' | 'delivered' | 'read';
  isOutgoing?: boolean;
  isPinned?: boolean;
  pinnedBy?: string;
  pinnedAt?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  isSaved?: boolean;
  timestamp: string;
  createdAt?: string;
  updatedAt?: string;
  location?: {
    lat: number;
    lng: number;
    isLive?: boolean;
  };
  poll?: {
    question: string;
    options: string[];
    votes: Record<number, string[]>;
    multiple?: boolean;
  };
}

export interface ChatMember {
  id: string;
  name: string;
  avatar: string;
  phone?: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  joinedAt?: string;
  isOnline?: boolean;
  lastSeenAt?: string;
  muted?: boolean;
  banned?: boolean;
}

export interface ChatRoomPermissions {
  sendMessages: boolean;
  sendMedia: boolean;
  addMembers: boolean;
  pinMessages: boolean;
  editRoom: boolean;
  deleteMessages: boolean;
  startCalls: boolean;
  mentionEveryone: boolean;
}

export interface ChatRoomSettings {
  disappearing: 'off' | '24h' | '7d' | '90d';
  muted: boolean;
  readReceipts: boolean;
  typingIndicator: boolean;
  linkPreviews: boolean;
  mediaAutoSave: boolean;
  enterToSend: boolean;
  slowModeSeconds: 0 | 10 | 30 | 60 | 300;
  approvalRequired: boolean;
}

export interface SavedMessageItem {
  id: string;
  roomId: string;
  roomTitle: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  body?: string;
  mediaUrl?: string;
  type?: string;
  savedAt: string;
  timestamp: string;
}


// ---------------------------
// 11. MEDIA & PDF / OCR
// ---------------------------

export type ThemeMode = "light" | "dark";
export type IconStyle = "classic" | "soft" | "bold" | "glow";
