export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatINRPrecise(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export function formatDateIndian(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(): string {
  const now = new Date();
  return now.toLocaleTimeString('en-IN', {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function calculateDefaultCommission(category: string, amount: number): { customerCharge: number; bankCommission: number } {
  const amt = Number(amount) || 0;
  switch (category) {
    case 'AEPS_WITHDRAWAL':
      // Typical AEPS Bank commission slab + standard convenience fee
      let bComm = 0;
      if (amt >= 500 && amt < 1000) bComm = 2;
      else if (amt >= 1000 && amt < 2000) bComm = 4;
      else if (amt >= 2000 && amt < 3000) bComm = 6;
      else if (amt >= 3000 && amt < 5000) bComm = 8;
      else if (amt >= 5000) bComm = 10;
      
      // Customer convenience charge (e.g. ₹10 per ₹1000 or ₹20 minimum)
      const cCharge = amt >= 1000 ? Math.round(amt * 0.005) : 10;
      return { customerCharge: cCharge, bankCommission: bComm };

    case 'MONEY_TRANSFER_DMT':
      // 1% taken from customer, portal keeps 0.4%, shop keeps 0.6%
      const charge = Math.max(25, Math.round(amt * 0.01));
      return { customerCharge: charge, bankCommission: 0 };

    case 'BILL_PAYMENT':
      return { customerCharge: 15, bankCommission: 2 };

    case 'MOBILE_DTH_RECHARGE':
      // 3% operator commission
      return { customerCharge: 0, bankCommission: Math.round(amt * 0.03) };

    case 'GOVT_FORM_FILLING':
      return { customerCharge: 80, bankCommission: 0 };

    case 'XEROX_PRINT_LAMIN':
      return { customerCharge: 10, bankCommission: 0 };

    case 'PAN_PASSPORT_CARD':
      return { customerCharge: 70, bankCommission: 0 };

    case 'CERTIFICATE_CASTE_INC':
      return { customerCharge: 50, bankCommission: 0 };

    default:
      return { customerCharge: 0, bankCommission: 0 };
  }
}
