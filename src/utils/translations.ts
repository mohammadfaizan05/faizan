import { Language, ServiceCategory, PaymentMode } from '../types';

export interface TranslationDict {
  shopTitle: string;
  shopSubtitle: string;
  adminNameLabel: string;
  developerCredit: string;
  navDailyLedger: string;
  navKhataBook: string;
  navCashDrawer: string;
  navReports: string;
  navExpenses: string;
  navAuditLogs: string;
  quickNewEntry: string;
  quickCashJama: string;
  quickCashNikasi: string;
  totalInflow: string;
  totalOutflow: string;
  totalProfit: string;
  totalCommission: string;
  cashInHand: string;
  digitalPayments: string;
  todayTransactions: string;
  searchPlaceholder: string;
  filterAll: string;
  filterToday: string;
  filterYesterday: string;
  filterThisMonth: string;
  addTransactionTitle: string;
  customerName: string;
  customerMobile: string;
  serviceCategory: string;
  amountVolume: string;
  customerFee: string;
  bankComm: string;
  netProfit: string;
  paymentMode: string;
  referenceNo: string;
  notes: string;
  saveBtn: string;
  cancelBtn: string;
  deleteBtn: string;
  editBtn: string;
  printReceiptBtn: string;
  shareWhatsApp: string;
  jamaCredit: string;
  udharDebit: string;
  totalMarketUdhar: string;
  totalAdvanceJama: string;
  customerKhataTitle: string;
  addNewCustomer: string;
  drawerReconciliation: string;
  physicalCashCount: string;
  ledgerBalance: string;
  differenceStatus: string;
  perfectMatch: string;
  cashShortage: string;
  cashSurplus: string;
  loginHeading: string;
  loginSubheading: string;
  masterPasswordLabel: string;
  enterPasswordPlaceholder: string;
  sendOtpBtn: string;
  verifyOtpBtn: string;
  enterOtpPlaceholder: string;
  otpValidityNotice: string;
  resendOtp: string;
  logoutBtn: string;
  securityNotice: string;
}

export const translations: Record<Language, TranslationDict> = {
  hi: {
    shopTitle: 'मोहम्मद फैज़ान जन सेवा केंद्र',
    shopSubtitle: 'दैनिक एवं मासिक वित्तीय हिसाब-किताब व डिजिटल सेवा पोर्टल',
    adminNameLabel: 'संचालक: मोहम्मद फैज़ान',
    developerCredit: 'डेवलपर: मोहम्मद शाहरुख (Mohammad Shahrukh)',
    navDailyLedger: 'दैनिक हिसाब-किताब',
    navKhataBook: 'ग्राहक खाता-बही (उधार)',
    navCashDrawer: 'गल्ला / कैश काउंटर मिलान',
    navReports: 'मासिक व वार्षिक रिपोर्ट',
    navExpenses: 'दुकान खर्च',
    navAuditLogs: 'सुरक्षा व ऑडिट लॉग',
    quickNewEntry: '+ नया लेनदेन दर्ज करें',
    quickCashJama: '+ नकद जमा (Inflow)',
    quickCashNikasi: '- नकद निकासी (Outflow)',
    totalInflow: 'कुल जमा (Inflow)',
    totalOutflow: 'कुल निकासी (Outflow)',
    totalProfit: 'दुकान का शुद्ध लाभ',
    totalCommission: 'कुल अर्जित कमीशन',
    cashInHand: 'गल्ले में नकद',
    digitalPayments: 'डिजिटल / बैंक भुगतान',
    todayTransactions: 'आज के कुल लेनदेन',
    searchPlaceholder: 'ग्राहक का नाम, मोबाइल नंबर, UTR या सेवा खोजें...',
    filterAll: 'सभी',
    filterToday: 'आज',
    filterYesterday: 'कल',
    filterThisMonth: 'इस महीने',
    addTransactionTitle: 'नया वित्तीय लेनदेन दर्ज करें',
    customerName: 'ग्राहक का नाम',
    customerMobile: 'मोबाइल नंबर',
    serviceCategory: 'सेवा का प्रकार (Service)',
    amountVolume: 'लेनदेन राशि (Principal ₹)',
    customerFee: 'ग्राहक से लिया शुल्क (₹)',
    bankComm: 'बैंक / पोर्टल कमीशन (₹)',
    netProfit: 'कुल शुद्ध बचत (₹)',
    paymentMode: 'भुगतान का माध्यम (Payment Mode)',
    referenceNo: 'RRN / UTR / रसीद संख्या',
    notes: 'विशेष विवरण / नोट',
    saveBtn: 'सुरक्षित सहेजें (Save)',
    cancelBtn: 'रद्द करें',
    deleteBtn: 'हटाएं',
    editBtn: 'संशोधित करें',
    printReceiptBtn: 'रसीद प्रिंट करें',
    shareWhatsApp: 'व्हाट्सएप तकादा भेजें',
    jamaCredit: 'जमा (Jama +)',
    udharDebit: 'उधार (Udhar -)',
    totalMarketUdhar: 'बाजार में कुल उधार (Total Due)',
    totalAdvanceJama: 'कुल अग्रिम जमा (Advance)',
    customerKhataTitle: 'ग्राहक उधार एवं डिजिटल खाता-बही',
    addNewCustomer: '+ नया ग्राहक जोड़ें',
    drawerReconciliation: 'गल्ला मिलान व कैश काउंटर',
    physicalCashCount: 'भौतिक नोटों की गिनती (Drawer Cash)',
    ledgerBalance: 'डिजिटल बहीखाता शेष (Ledger Balance)',
    differenceStatus: 'अंतर की स्थिति (Difference)',
    perfectMatch: 'बिल्कुल सही मिलान (No Discrepancy)',
    cashShortage: 'कैश कम है (Shortage)',
    cashSurplus: 'कैश अधिक है (Surplus)',
    loginHeading: 'सुरक्षित 2-स्टेप एडमिन लॉगिन',
    loginSubheading: 'मोहम्मद फैज़ान जन सेवा केंद्र - सुरक्षा प्रमाणीकरण',
    masterPasswordLabel: 'मास्टर एडमिन पासवर्ड',
    enterPasswordPlaceholder: 'मास्टर पासवर्ड दर्ज करें...',
    sendOtpBtn: 'सुरक्षित OTP भेजें (Gmail)',
    verifyOtpBtn: 'OTP सत्यापित करें और लॉगिन करें',
    enterOtpPlaceholder: '6-अंकों का OTP दर्ज करें',
    otpValidityNotice: 'OTP केवल 5 मिनट के लिए मान्य है। आपके ईमेल faizantaj9045@gmail.com पर भेजा गया है।',
    resendOtp: 'पुनः OTP भेजें',
    logoutBtn: 'लॉगआउट',
    securityNotice: '2-स्टेप रियल जीमेल OTP सुरक्षा सक्रिय है',
  },
  en: {
    shopTitle: 'Mohammad Faizan Jan Seva Kendra',
    shopSubtitle: 'Daily & Monthly Financial Ledger & CSC Portal',
    adminNameLabel: 'Owner: Mohammad Faizan',
    developerCredit: 'Developed by Mohammad Shahrukh',
    navDailyLedger: 'Daily Ledger',
    navKhataBook: 'Customer Khata (Udhaar)',
    navCashDrawer: 'Cash Drawer Reconciliation',
    navReports: 'Reports & Analytics',
    navExpenses: 'Shop Expenses',
    navAuditLogs: 'Audit & Security Logs',
    quickNewEntry: '+ New Transaction',
    quickCashJama: '+ Cash Inflow',
    quickCashNikasi: '- Cash Outflow',
    totalInflow: 'Total Cash Inflow',
    totalOutflow: 'Total Cash Outflow',
    totalProfit: 'Total Net Profit',
    totalCommission: 'Commission Earned',
    cashInHand: 'Physical Cash Balance',
    digitalPayments: 'Digital / UPI Payments',
    todayTransactions: "Today's Transactions",
    searchPlaceholder: 'Search by Customer, Mobile, UTR or Service...',
    filterAll: 'All Records',
    filterToday: 'Today',
    filterYesterday: 'Yesterday',
    filterThisMonth: 'This Month',
    addTransactionTitle: 'Record Financial Transaction',
    customerName: 'Customer Name',
    customerMobile: 'Mobile Number',
    serviceCategory: 'Service Category',
    amountVolume: 'Transaction Amount (₹)',
    customerFee: 'Customer Charge (₹)',
    bankComm: 'Bank Commission (₹)',
    netProfit: 'Total Net Profit (₹)',
    paymentMode: 'Payment Mode',
    referenceNo: 'RRN / UTR / Reference No',
    notes: 'Remarks / Notes',
    saveBtn: 'Save Entry',
    cancelBtn: 'Cancel',
    deleteBtn: 'Delete',
    editBtn: 'Edit',
    printReceiptBtn: 'Print Thermal Receipt',
    shareWhatsApp: 'WhatsApp Reminder',
    jamaCredit: 'Credit / Jama (+)',
    udharDebit: 'Debit / Udhaar (-)',
    totalMarketUdhar: 'Total Market Udhaar (Receivable)',
    totalAdvanceJama: 'Total Advance Deposit',
    customerKhataTitle: 'Customer Khata & Credit Ledger',
    addNewCustomer: '+ Add New Customer',
    drawerReconciliation: 'Cash Counter & Drawer Reconciliation',
    physicalCashCount: 'Counted Physical Cash',
    ledgerBalance: 'Calculated Ledger Cash',
    differenceStatus: 'Reconciliation Status',
    perfectMatch: 'Exact Match (0 Discrepancy)',
    cashShortage: 'Cash Shortage Alert',
    cashSurplus: 'Cash Surplus Alert',
    loginHeading: 'Secure 2-Step Admin Authentication',
    loginSubheading: 'Mohammad Faizan Jan Seva Kendra - Financial Portal',
    masterPasswordLabel: 'Master Security Password',
    enterPasswordPlaceholder: 'Enter master password...',
    sendOtpBtn: 'Send 2FA OTP to Gmail',
    verifyOtpBtn: 'Verify OTP & Enter Portal',
    enterOtpPlaceholder: 'Enter 6-digit OTP code',
    otpValidityNotice: 'OTP valid for 5 mins. Sent directly to faizantaj9045@gmail.com inbox.',
    resendOtp: 'Resend OTP Code',
    logoutBtn: 'Sign Out',
    securityNotice: '2-Step Real Gmail OTP Security Active',
  },
  hinglish: {
    shopTitle: 'Mohammad Faizan Jan Seva Kendra',
    shopSubtitle: 'Dainik aur Monthly Hisab-Kitab & AEPS Portal',
    adminNameLabel: 'Owner: Mohammad Faizan (9045174146)',
    developerCredit: 'Developer: Mohammad Shahrukh',
    navDailyLedger: 'Daily Hisab-Kitab',
    navKhataBook: 'Grahak Udhar / Khata',
    navCashDrawer: 'Galla & Cash Counter',
    navReports: 'Profit & Monthly Reports',
    navExpenses: 'Dukan Kharch (Expenses)',
    navAuditLogs: 'Security & Audit Logs',
    quickNewEntry: '+ Naya Hisab Add Karein',
    quickCashJama: '+ Cash Jama (Inflow)',
    quickCashNikasi: '- Cash Nikasi (AEPS/Outflow)',
    totalInflow: 'Total Cash Jama (Inflow)',
    totalOutflow: 'Total Cash Nikasi (Outflow)',
    totalProfit: 'Dukan ka Shuddh Munafa',
    totalCommission: 'Commission Kamai',
    cashInHand: 'Galle me Cash (Cash in Hand)',
    digitalPayments: 'UPI / Online Payments',
    todayTransactions: 'Aaj ke Total Transactions',
    searchPlaceholder: 'Customer name, mobile number, UTR number se khojein...',
    filterAll: 'Sabhi Entries',
    filterToday: 'Aaj (Today)',
    filterYesterday: 'Kal (Yesterday)',
    filterThisMonth: 'Is Mahine (This Month)',
    addTransactionTitle: 'Naya Financial Entry Karein',
    customerName: 'Customer ka Naam',
    customerMobile: 'Mobile Number',
    serviceCategory: 'Service Chunein',
    amountVolume: 'Transaction Amount (₹)',
    customerFee: 'Customer Charge (₹)',
    bankComm: 'Bank Commission (₹)',
    netProfit: 'Total Profit (₹)',
    paymentMode: 'Payment Mode',
    referenceNo: 'RRN / UTR / Reference No',
    notes: 'Khas Note / Detail',
    saveBtn: 'Save Karein',
    cancelBtn: 'Cancel',
    deleteBtn: 'Delete',
    editBtn: 'Edit',
    printReceiptBtn: 'Receipt Print Karein',
    shareWhatsApp: 'WhatsApp Payment Reminder',
    jamaCredit: 'Jama (+)',
    udharDebit: 'Udhar (-)',
    totalMarketUdhar: 'Bazaar me Kul Udhar',
    totalAdvanceJama: 'Advance Jama',
    customerKhataTitle: 'Customer Udhar aur Khata-Bahi',
    addNewCustomer: '+ Naya Customer Jodein',
    drawerReconciliation: 'Galla aur Cash Milān',
    physicalCashCount: 'Galle me Giney Hue Note',
    ledgerBalance: 'Hisab ke hisaab se Cash',
    differenceStatus: 'Galla Status',
    perfectMatch: 'Pura Cash Barabar Hai (0 Antar)',
    cashShortage: 'Galle me Cash Kam Hai!',
    cashSurplus: 'Galle me Cash Zyada Hai!',
    loginHeading: '2-Step Secure Admin Login',
    loginSubheading: 'Mohammad Faizan Jan Seva Kendra Portal',
    masterPasswordLabel: 'Master Password',
    enterPasswordPlaceholder: 'Master password dalein...',
    sendOtpBtn: 'Gmail OTP Bhejein',
    verifyOtpBtn: 'OTP Verify Karke Login Karein',
    enterOtpPlaceholder: '6-digit OTP code dalein',
    otpValidityNotice: 'OTP 5 minute tak valid hai. faizantaj9045@gmail.com inbox check karein.',
    resendOtp: 'Dobara OTP Bhejein',
    logoutBtn: 'Logout',
    securityNotice: 'Real Gmail OTP Security Active',
  },
};

export const serviceCategoryLabels: Record<ServiceCategory, { hi: string; en: string; hinglish: string; iconName: string; defaultCommissionRate: string }> = {
  AEPS_WITHDRAWAL: {
    hi: 'AEPS नकद निकासी (आधार)',
    en: 'AEPS Cash Withdrawal',
    hinglish: 'AEPS Cash Nikasi (Aadhaar)',
    iconName: 'Fingerprint',
    defaultCommissionRate: '₹3 to ₹10 / tx',
  },
  AEPS_DEPOSIT: {
    hi: 'AEPS नकद जमा',
    en: 'AEPS Cash Deposit',
    hinglish: 'AEPS Cash Deposit',
    iconName: 'PiggyBank',
    defaultCommissionRate: '0.2% comm',
  },
  MONEY_TRANSFER_DMT: {
    hi: 'मनी ट्रांसफर (DMT/IMPS)',
    en: 'Domestic Money Transfer',
    hinglish: 'Money Transfer (DMT)',
    iconName: 'Send',
    defaultCommissionRate: '1% Customer Fee',
  },
  BILL_PAYMENT: {
    hi: 'बिजली / पानी / गैस बिल भुगतान',
    en: 'Electricity & Utility Bills',
    hinglish: 'Bijli / Gas Bill Payment',
    iconName: 'Zap',
    defaultCommissionRate: '₹10 to ₹20 / bill',
  },
  MOBILE_DTH_RECHARGE: {
    hi: 'मोबाइल व DTH रिचार्ज',
    en: 'Mobile & DTH Recharge',
    hinglish: 'Mobile / DTH Recharge',
    iconName: 'Smartphone',
    defaultCommissionRate: '2.5% to 3.5%',
  },
  GOVT_FORM_FILLING: {
    hi: 'सरकारी फॉर्म (Online Apply)',
    en: 'Govt Job & Scheme Forms',
    hinglish: 'Sarkari Online Form Filling',
    iconName: 'FileText',
    defaultCommissionRate: '₹50 to ₹150 / form',
  },
  XEROX_PRINT_LAMIN: {
    hi: 'फोटोकॉपी / प्रिंट / लैमिनेशन',
    en: 'Xerox, Print & Lamination',
    hinglish: 'Photocopy / Print / Lamination',
    iconName: 'Printer',
    defaultCommissionRate: '₹2 to ₹30 / page',
  },
  PAN_PASSPORT_CARD: {
    hi: 'पैन कार्ड / पासपोर्ट आवेदन',
    en: 'PAN Card & Passport Services',
    hinglish: 'PAN Card / Passport Service',
    iconName: 'CreditCard',
    defaultCommissionRate: '₹50 to ₹100 / card',
  },
  CERTIFICATE_CASTE_INC: {
    hi: 'आय / जाति / निवास प्रमाण पत्र',
    en: 'Income/Caste/Domicile Cert',
    hinglish: 'Aay / Jati / Niwas Certificate',
    iconName: 'Award',
    defaultCommissionRate: '₹50 / cert',
  },
  CASH_DEPOSIT_BANK: {
    hi: 'बैंक खाता नकद जमा',
    en: 'Bank Cash Deposit',
    hinglish: 'Bank Account Cash Jama',
    iconName: 'Building2',
    defaultCommissionRate: '₹10 to ₹30',
  },
  INSURANCE_PREMIUM: {
    hi: 'LIC / बीमा प्रीमियम भुगतान',
    en: 'Insurance Premium Payment',
    hinglish: 'Insurance / LIC Premium',
    iconName: 'ShieldCheck',
    defaultCommissionRate: '₹20 to ₹50',
  },
  SHOP_EXPENSE: {
    hi: 'दुकान का खर्च (Expense)',
    en: 'Shop Operating Expense',
    hinglish: 'Dukan ka Kharch',
    iconName: 'Receipt',
    defaultCommissionRate: '₹0',
  },
  OTHER_SERVICE: {
    hi: 'अन्य सेवाएं / Miscellaneous',
    en: 'Other CSC Services',
    hinglish: 'Other CSC Services',
    iconName: 'Briefcase',
    defaultCommissionRate: 'Custom',
  },
};
