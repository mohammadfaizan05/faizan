export type Language = 'en' | 'hi' | 'hinglish';

export type ServiceCategory =
  | 'AEPS_WITHDRAWAL'      // AEPS नकद निकासी
  | 'AEPS_DEPOSIT'         // AEPS आधार जमा
  | 'MONEY_TRANSFER_DMT'   // मनी ट्रांसफर (DMT)
  | 'BILL_PAYMENT'         // बिजली / पानी / गैस बिल
  | 'MOBILE_DTH_RECHARGE'  // मोबाइल / DTH रिचार्ज
  | 'GOVT_FORM_FILLING'    // ऑनलाइन सरकारी फॉर्म
  | 'XEROX_PRINT_LAMIN'    // फोटोकॉपी / प्रिंट / लैमिनेशन
  | 'PAN_PASSPORT_CARD'    // पैन कार्ड / पासपोर्ट सेवा
  | 'CERTIFICATE_CASTE_INC'// आय / जाति / निवास प्रमाण पत्र
  | 'CASH_DEPOSIT_BANK'    // बैंक नकद जमा
  | 'INSURANCE_PREMIUM'    // बीमा किस्त
  | 'SHOP_EXPENSE'         // दुकान का खर्च
  | 'OTHER_SERVICE';       // अन्य सेवाएं

export type PaymentMode =
  | 'CASH'
  | 'UPI_PHONEPE'
  | 'UPI_GPAY'
  | 'UPI_PAYTM'
  | 'UPI_OTHER'
  | 'BANK_TRANSFER'
  | 'CARD';

export type TransactionType = 'inflow' | 'outflow'; // inflow: Jama (customer gives cash/money), outflow: Nikasi (shopkeeper pays cash to customer / vendor)

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  timestamp: number;
  customerName: string;
  customerMobile?: string;
  serviceCategory: ServiceCategory;
  serviceNameCustom?: string;
  transactionType: TransactionType;
  amount: number; // The principal transaction volume (e.g. ₹5,000 withdrawal)
  customerCharge: number; // Extra charge taken from customer (e.g. ₹50)
  bankCommission: number; // Commission earned from bank/portal (e.g. ₹10)
  netProfit: number; // Total profit for shop (customerCharge + bankCommission - providerFee)
  paymentMode: PaymentMode;
  referenceNumber?: string; // RRN, UTR, Ack No.
  aadhaarLast4?: string;
  bankName?: string;
  notes?: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REVERSED';
  isExpense?: boolean;
}

export interface CustomerKhataEntry {
  id: string;
  customerId: string;
  date: string;
  time: string;
  timestamp: number;
  type: 'jama' | 'udhar'; // 'jama': customer gave money (reduces debt), 'udhar': customer took money/service on credit (increases debt)
  amount: number;
  description: string;
  paymentMode: PaymentMode;
  balanceAfter: number;
  recordedBy: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  aadhaarLast4?: string;
  villageOrArea?: string;
  address?: string;
  totalUdhar: number; // Total given on credit
  totalJama: number;  // Total paid back
  balanceDue: number; // Positive = Customer owes us (Udhar), Negative = Customer has advance balance
  lastTransactionDate: string;
  createdAt: string;
  notes?: string;
  history: CustomerKhataEntry[];
}

export interface CashDenominationRecord {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  openingCash: number;
  notes500: number;
  notes200: number;
  notes100: number;
  notes50: number;
  notes20: number;
  notes10: number;
  coinsTotal: number;
  totalPhysicalCash: number;
  digitalLedgerCash: number; // Calculated from today's cash inflow - cash outflow + opening cash
  discrepancy: number; // totalPhysicalCash - digitalLedgerCash (0 = match, - = short, + = excess)
  notes?: string;
  verifiedBy: string;
  verifiedAt: string;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  time: string;
  title: string;
  category: 'ELECTRICITY_INTERNET' | 'PAPER_STATIONERY' | 'SHOP_RENT' | 'TEA_SNACKS' | 'MAINTENANCE' | 'STAFF_HELPER' | 'OTHER';
  amount: number;
  paymentMode: PaymentMode;
  notes?: string;
  recordedBy: string;
}

export interface AuditLog {
  id: string;
  timestamp: number;
  dateStr: string;
  ip: string;
  action: string;
  details: string;
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER';
  user: string;
}

export interface AuthSession {
  token: string;
  adminName: string;
  shopName: string;
  email: string;
  mobile: string;
  developerName: string;
  expiresAt: number;
}

export interface DailySummary {
  date: string;
  totalVolume: number;
  totalCashInflow: number;
  totalCashOutflow: number;
  totalDigitalInflow: number;
  totalDigitalOutflow: number;
  totalCommissionEarned: number;
  totalNetProfit: number;
  totalTransactionsCount: number;
  totalExpenses: number;
  netDayEarnings: number; // Net profit - expenses
  categoryBreakdown: { [category: string]: { count: number; volume: number; profit: number } };
}
