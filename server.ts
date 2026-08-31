import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const HOST = '0.0.0.0';

// Master credentials & profile
const STORE_INFO = {
  shopName: 'Mohammad Faizan Jan Seva Kendra',
  adminName: 'Mohammad Faizan',
  mobile: '9045174146',
  email: process.env.ADMIN_NOTIFICATION_EMAIL || 'faizantaj9045@gmail.com',
  developerName: 'Mohammad Shahrukh',
};

const MASTER_PASSWORD = process.env.MASTER_PASSWORD || 'Zubiya@01';

// In-Memory Security & 2FA State
interface OtpState {
  otp: string;
  expiresAt: number;
  failedAttempts: number;
  lockedUntil: number;
  email: string;
  tempSessionId: string;
}

let activeOtpState: OtpState | null = null;
const activeTokens = new Set<string>();

// Data Storage Path
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Database Structure (Clean Live State)
function getInitialSeedData() {
  const today = new Date().toISOString().split('T')[0];

  return {
    transactions: [],
    customers: [],
    cashDrawer: {
      id: `DRAWER-${today}`,
      date: today,
      time: '09:00:00 AM',
      openingCash: 0,
      notes500: 0,
      notes200: 0,
      notes100: 0,
      notes50: 0,
      notes20: 0,
      notes10: 0,
      coinsTotal: 0,
      totalPhysicalCash: 0,
      digitalLedgerCash: 0,
      discrepancy: 0,
      notes: 'Cash drawer initialized for live transactions',
      verifiedBy: 'Mohammad Faizan',
      verifiedAt: `${today} 09:00 AM`,
    },
    expenses: [],
    auditLogs: [
      {
        id: 'AUD-0001',
        timestamp: Date.now(),
        dateStr: new Date().toLocaleString('en-IN', { hour12: true }),
        ip: '127.0.0.1',
        action: 'SYSTEM_INITIALIZED',
        details: 'Financial Ledger initialized with clean zero-state for live transactions',
        severity: 'SUCCESS',
        user: 'Mohammad Faizan',
      },
    ],
  };
}

// Database helper functions
function readDatabase() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = getInitialSeedData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file, using fallback memory:', err);
    return getInitialSeedData();
  }
}

function writeDatabase(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to database file:', err);
  }
}

function logAudit(action: string, details: string, severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER' = 'INFO', req?: Request, user: string = 'Mohammad Faizan') {
  const db = readDatabase();
  const ip = (req?.headers['x-forwarded-for'] as string) || req?.socket?.remoteAddress || '127.0.0.1';
  const now = new Date();
  const dateStr = now.toLocaleString('en-IN', { hour12: true });

  const newLog = {
    id: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: Date.now(),
    dateStr,
    ip,
    action,
    details,
    severity,
    user,
  };

  db.auditLogs = [newLog, ...(db.auditLogs || [])].slice(0, 200); // Keep last 200 logs
  writeDatabase(db);
  console.log(`[AUDIT LOG] ${severity} | ${action} | ${details}`);
}

// Nodemailer setup for Real Gmail OTP with dual fallback (Port 587 STARTTLS & Port 465 SSL)
async function sendGmailOtp(otp: string, targetEmail: string): Promise<{ success: boolean; message: string; isRealSmtp: boolean }> {
  const gmailUser = (process.env.GMAIL_USER || 'faizantaj9045@gmail.com').trim();
  const rawPassword = process.env.GMAIL_APP_PASSWORD || '';
  const gmailPassword = rawPassword.replace(/\s+/g, ''); // Strip any accidental spaces from 16-digit Google App Password

  const htmlContent = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
    <div style="background: linear-gradient(135deg, #065f46 0%, #047857 100%); padding: 24px 30px; border-bottom: 2px solid #10b981;">
      <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px;">
        🏛️ Mohammad Faizan Jan Seva Kendra
      </h1>
      <p style="margin: 6px 0 0 0; color: #a7f3d0; font-size: 13px; font-weight: 500;">
        दैनिक एवं मासिक वित्तीय हिसाब-किताब पोर्टल • 2-Step Security Verification
      </p>
    </div>
    <div style="padding: 30px; background-color: #0f172a;">
      <p style="font-size: 15px; color: #e2e8f0; margin-top: 0;">
        Hello <strong>Mohammad Faizan</strong>,
      </p>
      <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
        A login attempt was initiated on your Jan Seva Kendra Financial Management Portal. Use the one-time cryptographic security code below to complete your 2-Step verification:
      </p>
      
      <div style="text-align: center; margin: 28px 0; padding: 20px; background: #1e293b; border-radius: 10px; border: 1px dashed #10b981;">
        <span style="font-size: 12px; color: #10b981; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 8px;">
          YOUR 2FA SECURITY OTP
        </span>
        <div style="font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #34d399; font-family: monospace;">
          ${otp}
        </div>
        <span style="font-size: 12px; color: #94a3b8; display: block; margin-top: 8px;">
          ⏳ Valid for exactly 5 minutes • Do not share with anyone
        </span>
      </div>

      <div style="background: #1e293b; padding: 14px 18px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #f59e0b;">
        <p style="margin: 0; font-size: 13px; color: #cbd5e1;">
          <strong>Security Notice:</strong> If you did not initiate this login request from your portal, please secure your master password immediately.
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #94a3b8;">
        <tr>
          <td style="padding: 4px 0;"><strong>Store Name:</strong> Mohammad Faizan Jan Seva Kendra</td>
        </tr>
        <tr>
          <td style="padding: 4px 0;"><strong>Registered Mobile:</strong> +91 9045174146</td>
        </tr>
        <tr>
          <td style="padding: 4px 0;"><strong>Developer:</strong> Mohammad Shahrukh</td>
        </tr>
      </table>
    </div>
    <div style="background: #090d16; padding: 16px 30px; font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid #1e293b;">
      © ${new Date().getFullYear()} Mohammad Faizan Jan Seva Kendra. All rights reserved. Automated security notification.
    </div>
  </div>
  `;

  // Always log OTP with high-visibility banner to server console (Render Live Logs)
  console.log('\n================================================================');
  console.log('  🏛️  MOHAMMAD FAIZAN JAN SEVA KENDRA - 2FA LOGIN OTP  🏛️');
  console.log('  --------------------------------------------------------------');
  console.log(`  📧 RECIPIENT EMAIL : ${targetEmail}`);
  console.log(`  🔑 6-DIGIT OTP     : >>> [ ${otp} ] <<<`);
  console.log('  ⏳ VALIDITY        : 5 MINUTES');
  console.log('================================================================\n');

  if (gmailPassword && gmailPassword.length > 0) {
    // Attempt 1: Port 587 with STARTTLS (Preferred for Render/Cloud containers)
    try {
      const transporter587 = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // STARTTLS
        auth: {
          user: gmailUser,
          pass: gmailPassword,
        },
        connectionTimeout: 7000,
        greetingTimeout: 7000,
        socketTimeout: 10000,
        tls: {
          rejectUnauthorized: false,
        },
      });

      await transporter587.sendMail({
        from: `"Jan Seva Kendra Security" <${gmailUser}>`,
        to: targetEmail,
        subject: `🔐 2FA OTP Code: ${otp} - Mohammad Faizan Jan Seva Kendra`,
        text: `Your 2-Step Login OTP for Mohammad Faizan Jan Seva Kendra is: ${otp}. Valid for 5 minutes.`,
        html: htmlContent,
      });

      console.log(`[SMTP SUCCESS] Real Gmail OTP delivered via Port 587 to ${targetEmail}`);
      return { success: true, message: `OTP sent successfully to ${targetEmail}`, isRealSmtp: true };
    } catch (err587: any) {
      console.warn('[SMTP WARNING] Port 587 failed, attempting Port 465 SSL fallback:', err587.message);

      // Attempt 2: Port 465 with direct SSL
      try {
        const transporter465 = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: gmailUser,
            pass: gmailPassword,
          },
          connectionTimeout: 7000,
          greetingTimeout: 7000,
          socketTimeout: 10000,
          tls: {
            rejectUnauthorized: false,
          },
        });

        await transporter465.sendMail({
          from: `"Jan Seva Kendra Security" <${gmailUser}>`,
          to: targetEmail,
          subject: `🔐 2FA OTP Code: ${otp} - Mohammad Faizan Jan Seva Kendra`,
          text: `Your 2-Step Login OTP for Mohammad Faizan Jan Seva Kendra is: ${otp}. Valid for 5 minutes.`,
          html: htmlContent,
        });

        console.log(`[SMTP SUCCESS] Real Gmail OTP delivered via Port 465 to ${targetEmail}`);
        return { success: true, message: `OTP sent successfully to ${targetEmail}`, isRealSmtp: true };
      } catch (err465: any) {
        console.error('[SMTP ERROR] Both Port 587 & 465 failed on Render:', err465.message);
        return {
          success: false,
          message: `Gmail SMTP Connection Timeout. (Please check Render Live Logs for OTP code [${otp}]).`,
          isRealSmtp: false,
        };
      }
    }
  } else {
    console.log(`[INFO] GMAIL_APP_PASSWORD is not set in environment. Use the OTP code logged above.`);
    return {
      success: true,
      message: `OTP generated for ${targetEmail}. Use the OTP code shown in Render Live Logs.`,
      isRealSmtp: false,
    };
  }
}

// Authentication Middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Bearer token missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!activeTokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
  }

  next();
}

async function startServer() {
  const app = express();

  app.use(express.json());

  // ===================== AUTHENTICATION ROUTES =====================

  // Step 1: Verify Master Password and Send Real Gmail OTP
  app.post('/api/auth/step1-verify-password', async (req: Request, res: Response) => {
    try {
      const { password } = req.body;

      // Check lockout
      if (activeOtpState && activeOtpState.lockedUntil > Date.now()) {
        const remainingMinutes = Math.ceil((activeOtpState.lockedUntil - Date.now()) / 60000);
        logAudit('LOGIN_LOCKOUT', `Blocked attempt: Account locked for ${remainingMinutes} more mins`, 'DANGER', req);
        return res.status(429).json({
          error: `Too many failed attempts. Security lockout active for ${remainingMinutes} more minutes.`,
          locked: true,
          remainingMinutes,
        });
      }

      if (password !== MASTER_PASSWORD) {
        if (!activeOtpState) {
          activeOtpState = {
            otp: '',
            expiresAt: 0,
            failedAttempts: 1,
            lockedUntil: 0,
            email: STORE_INFO.email,
            tempSessionId: '',
          };
        } else {
          activeOtpState.failedAttempts += 1;
        }

        logAudit('LOGIN_PWD_FAILED', `Incorrect password attempt (${activeOtpState.failedAttempts}/5)`, 'WARNING', req);

        if (activeOtpState.failedAttempts >= 5) {
          activeOtpState.lockedUntil = Date.now() + 15 * 60 * 1000; // 15-minute lock
          return res.status(429).json({
            error: '5 failed attempts reached! Account locked for 15 minutes for security.',
            locked: true,
          });
        }

        return res.status(401).json({
          error: `Invalid master password. Attempt ${activeOtpState.failedAttempts} of 5.`,
          remainingAttempts: 5 - activeOtpState.failedAttempts,
        });
      }

      // Password is correct! Generate 6-digit cryptographic OTP
      const otpNumber = crypto.randomInt(100000, 999999).toString();
      const tempSessionId = crypto.randomBytes(16).toString('hex');
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

      activeOtpState = {
        otp: otpNumber,
        expiresAt,
        failedAttempts: 0,
        lockedUntil: 0,
        email: STORE_INFO.email,
        tempSessionId,
      };

      // Send OTP to Gmail
      const mailResult = await sendGmailOtp(otpNumber, STORE_INFO.email);

      logAudit('OTP_SENT', `6-Digit OTP generated & dispatched to ${STORE_INFO.email}`, 'INFO', req);

      // Never expose OTP in JSON response to client
      return res.json({
        success: true,
        step: 2,
        tempSessionId,
        targetEmail: `${STORE_INFO.email.slice(0, 3)}***${STORE_INFO.email.slice(STORE_INFO.email.indexOf('@'))}`,
        expiresInSeconds: 300,
        isRealSmtp: mailResult.isRealSmtp,
        message: `6-Digit OTP sent to ${STORE_INFO.email}. Please check your Gmail inbox (and Spam folder).`,
      });
    } catch (err: any) {
      console.error('Error in step1 auth:', err);
      return res.status(500).json({ error: 'Internal server error during password verification' });
    }
  });

  // Step 2: Verify 6-Digit OTP and issue Bearer Token
  app.post('/api/auth/step2-verify-otp', (req: Request, res: Response) => {
    try {
      const { tempSessionId, otp } = req.body;

      if (!activeOtpState || !activeOtpState.otp || activeOtpState.tempSessionId !== tempSessionId) {
        return res.status(400).json({ error: 'No active OTP verification session found. Please start from Step 1.' });
      }

      if (Date.now() > activeOtpState.expiresAt) {
        logAudit('OTP_EXPIRED', 'User submitted expired OTP code', 'WARNING', req);
        return res.status(400).json({ error: 'OTP has expired (5-minute limit). Please click Resend OTP.' });
      }

      const cleanOtp = String(otp || '').trim();

      if (cleanOtp !== activeOtpState.otp) {
        activeOtpState.failedAttempts += 1;
        logAudit('OTP_VERIFY_FAILED', `Invalid OTP entered (${activeOtpState.failedAttempts}/5)`, 'WARNING', req);

        if (activeOtpState.failedAttempts >= 5) {
          activeOtpState.lockedUntil = Date.now() + 15 * 60 * 1000;
          return res.status(429).json({ error: '5 failed attempts! Account locked for 15 minutes.' });
        }

        return res.status(401).json({
          error: `Incorrect OTP. Please check your email inbox. (${5 - activeOtpState.failedAttempts} attempts left)`,
        });
      }

      // OTP is valid! Issue session token
      const sessionToken = `mfjsk_${crypto.randomBytes(32).toString('hex')}`;
      activeTokens.add(sessionToken);
      activeOtpState = null; // Clear OTP state

      logAudit('LOGIN_SUCCESS', 'Admin successfully authenticated via 2-Step Real Gmail OTP', 'SUCCESS', req);

      return res.json({
        success: true,
        token: sessionToken,
        user: {
          adminName: STORE_INFO.adminName,
          shopName: STORE_INFO.shopName,
          email: STORE_INFO.email,
          mobile: STORE_INFO.mobile,
          developerName: STORE_INFO.developerName,
        },
      });
    } catch (err: any) {
      console.error('Error in step2 auth:', err);
      return res.status(500).json({ error: 'Internal server error during OTP verification' });
    }
  });

  // Resend OTP
  app.post('/api/auth/resend-otp', async (req: Request, res: Response) => {
    try {
      const { tempSessionId } = req.body;
      if (!activeOtpState || activeOtpState.tempSessionId !== tempSessionId) {
        return res.status(400).json({ error: 'Invalid session. Please enter master password again.' });
      }

      const newOtp = crypto.randomInt(100000, 999999).toString();
      activeOtpState.otp = newOtp;
      activeOtpState.expiresAt = Date.now() + 5 * 60 * 1000;
      activeOtpState.failedAttempts = 0;

      const mailResult = await sendGmailOtp(newOtp, STORE_INFO.email);
      logAudit('OTP_RESENT', `New 6-Digit OTP generated & resent to ${STORE_INFO.email}`, 'INFO', req);

      return res.json({
        success: true,
        expiresInSeconds: 300,
        isRealSmtp: mailResult.isRealSmtp,
        message: `New OTP has been sent to ${STORE_INFO.email}.`,
      });
    } catch (err: any) {
      console.error('Error resending OTP:', err);
      return res.status(500).json({ error: 'Failed to resend OTP' });
    }
  });

  // Check Current Session Profile
  app.get('/api/auth/me', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ authenticated: false });
    }
    const token = authHeader.split(' ')[1];
    if (!activeTokens.has(token)) {
      return res.status(401).json({ authenticated: false });
    }

    return res.json({
      authenticated: true,
      user: {
        adminName: STORE_INFO.adminName,
        shopName: STORE_INFO.shopName,
        email: STORE_INFO.email,
        mobile: STORE_INFO.mobile,
        developerName: STORE_INFO.developerName,
      },
    });
  });

  // Logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      activeTokens.delete(token);
    }
    logAudit('LOGOUT', 'Admin signed out of portal', 'INFO', req);
    return res.json({ success: true, message: 'Logged out successfully' });
  });

  // Get Audit Logs
  app.get('/api/auth/audit-logs', requireAuth, (req: Request, res: Response) => {
    const db = readDatabase();
    res.json({ logs: db.auditLogs || [] });
  });

  // ===================== TRANSACTIONS (DAILY LEDGER) =====================

  // Get all transactions with filter
  app.get('/api/transactions', requireAuth, (req: Request, res: Response) => {
    const db = readDatabase();
    let txList = db.transactions || [];

    const { date, category, search, startDate, endDate } = req.query;

    if (date) {
      txList = txList.filter((t: any) => t.date === date);
    }

    if (startDate && endDate) {
      txList = txList.filter((t: any) => t.date >= String(startDate) && t.date <= String(endDate));
    }

    if (category && category !== 'ALL') {
      txList = txList.filter((t: any) => t.serviceCategory === category);
    }

    if (search) {
      const q = String(search).toLowerCase();
      txList = txList.filter(
        (t: any) =>
          t.customerName?.toLowerCase().includes(q) ||
          t.customerMobile?.includes(q) ||
          t.referenceNumber?.toLowerCase().includes(q) ||
          t.notes?.toLowerCase().includes(q) ||
          t.id?.toLowerCase().includes(q)
      );
    }

    // Sort descending by timestamp
    txList.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));

    res.json({ transactions: txList });
  });

  // Create new transaction
  app.post('/api/transactions', requireAuth, (req: Request, res: Response) => {
    const db = readDatabase();
    const body = req.body;

    const now = new Date();
    const date = body.date || now.toISOString().split('T')[0];
    const time = body.time || now.toLocaleTimeString('en-IN', { hour12: true });
    const timestamp = Date.now();

    const amount = Number(body.amount) || 0;
    const customerCharge = Number(body.customerCharge) || 0;
    const bankCommission = Number(body.bankCommission) || 0;
    const netProfit = Number(body.netProfit) || customerCharge + bankCommission;

    const newTx = {
      id: `TX-${Date.now().toString().slice(-6)}`,
      date,
      time,
      timestamp,
      customerName: body.customerName || 'Walk-in Customer',
      customerMobile: body.customerMobile || '',
      serviceCategory: body.serviceCategory || 'OTHER_SERVICE',
      serviceNameCustom: body.serviceNameCustom || '',
      transactionType: body.transactionType || 'inflow',
      amount,
      customerCharge,
      bankCommission,
      netProfit,
      paymentMode: body.paymentMode || 'CASH',
      referenceNumber: body.referenceNumber || '',
      aadhaarLast4: body.aadhaarLast4 || '',
      bankName: body.bankName || '',
      notes: body.notes || '',
      status: body.status || 'COMPLETED',
    };

    db.transactions = [newTx, ...(db.transactions || [])];
    writeDatabase(db);

    logAudit(
      'TRANSACTION_CREATED',
      `Recorded ${newTx.serviceCategory} of ₹${newTx.amount} (Profit: ₹${newTx.netProfit}) for ${newTx.customerName}`,
      'SUCCESS',
      req
    );

    res.status(201).json({ success: true, transaction: newTx });
  });

  // Delete transaction
  app.delete('/api/transactions/:id', requireAuth, (req: Request, res: Response) => {
    const db = readDatabase();
    const { id } = req.params;
    const existing = db.transactions.find((t: any) => t.id === id);

    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    db.transactions = db.transactions.filter((t: any) => t.id !== id);
    writeDatabase(db);

    logAudit(
      'TRANSACTION_DELETED',
      `Deleted transaction ${id} (${existing.serviceCategory} ₹${existing.amount} by ${existing.customerName})`,
      'WARNING',
      req
    );

    res.json({ success: true, message: 'Transaction deleted' });
  });

  // ===================== CUSTOMER KHATA (UDHAAR BOOK) =====================

  // Get all customers
  app.get('/api/customers', requireAuth, (req: Request, res: Response) => {
    const db = readDatabase();
    let custList = db.customers || [];
    const { search } = req.query;

    if (search) {
      const q = String(search).toLowerCase();
      custList = custList.filter(
        (c: any) =>
          c.name?.toLowerCase().includes(q) ||
          c.mobile?.includes(q) ||
          c.aadhaarLast4?.includes(q) ||
          c.villageOrArea?.toLowerCase().includes(q)
      );
    }

    res.json({ customers: custList });
  });

  // Create new customer
  app.post('/api/customers', requireAuth, (req: Request, res: Response) => {
    const db = readDatabase();
    const body = req.body;

    const newCustomer = {
      id: `CUST-${Date.now().toString().slice(-4)}`,
      name: body.name,
      mobile: body.mobile,
      aadhaarLast4: body.aadhaarLast4 || '',
      villageOrArea: body.villageOrArea || '',
      address: body.address || '',
      totalUdhar: Number(body.initialUdhar) || 0,
      totalJama: 0,
      balanceDue: Number(body.initialUdhar) || 0,
      lastTransactionDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      notes: body.notes || '',
      history: body.initialUdhar
        ? [
            {
              id: `K-${Date.now().toString().slice(-6)}`,
              customerId: `CUST-${Date.now().toString().slice(-4)}`,
              date: new Date().toISOString().split('T')[0],
              time: new Date().toLocaleTimeString('en-IN', { hour12: true }),
              timestamp: Date.now(),
              type: 'udhar',
              amount: Number(body.initialUdhar),
              description: 'Opening Old Udhaar Balance',
              paymentMode: 'CASH',
              balanceAfter: Number(body.initialUdhar),
              recordedBy: STORE_INFO.adminName,
            },
          ]
        : [],
    };

    db.customers = [newCustomer, ...(db.customers || [])];
    writeDatabase(db);

    logAudit('CUSTOMER_CREATED', `Added new customer profile: ${newCustomer.name} (${newCustomer.mobile})`, 'INFO', req);
    res.status(201).json({ success: true, customer: newCustomer });
  });

  // Add Khata Entry (Jama / Udhar) for a customer
  app.post('/api/customers/:id/entry', requireAuth, (req: Request, res: Response) => {
    const db = readDatabase();
    const { id } = req.params;
    const { type, amount, description, paymentMode } = req.body;

    const customerIndex = db.customers.findIndex((c: any) => c.id === id);
    if (customerIndex === -1) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const customer = db.customers[customerIndex];
    const amt = Number(amount) || 0;
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toLocaleTimeString('en-IN', { hour12: true });

    let newBalance = customer.balanceDue;
    if (type === 'udhar') {
      customer.totalUdhar = (customer.totalUdhar || 0) + amt;
      newBalance += amt;
    } else {
      customer.totalJama = (customer.totalJama || 0) + amt;
      newBalance -= amt;
    }

    customer.balanceDue = newBalance;
    customer.lastTransactionDate = date;

    const newEntry = {
      id: `K-${Date.now().toString().slice(-6)}`,
      customerId: id,
      date,
      time,
      timestamp: Date.now(),
      type,
      amount: amt,
      description: description || (type === 'jama' ? 'Cash Received' : 'Service Credit'),
      paymentMode: paymentMode || 'CASH',
      balanceAfter: newBalance,
      recordedBy: STORE_INFO.adminName,
    };

    customer.history = [newEntry, ...(customer.history || [])];
    db.customers[customerIndex] = customer;
    writeDatabase(db);

    logAudit(
      'KHATA_ENTRY_ADDED',
      `Khata ${type.toUpperCase()} of ₹${amt} recorded for ${customer.name}. New Balance: ₹${newBalance}`,
      type === 'jama' ? 'SUCCESS' : 'WARNING',
      req
    );

    res.json({ success: true, customer, entry: newEntry });
  });

  // Delete Customer
  app.delete('/api/customers/:id', requireAuth, (req: Request, res: Response) => {
    const db = readDatabase();
    const { id } = req.params;
    db.customers = db.customers.filter((c: any) => c.id !== id);
    writeDatabase(db);
    logAudit('CUSTOMER_DELETED', `Removed customer ${id}`, 'WARNING', req);
    res.json({ success: true });
  });

  // ===================== CASH DRAWER RECONCILIATION =====================

  // Get today's drawer record
  app.get('/api/cash-drawer', requireAuth, (req: Request, res: Response) => {
    const db = readDatabase();
    const today = new Date().toISOString().split('T')[0];

    let drawer = db.cashDrawer;
    if (!drawer || drawer.date !== today) {
      // Calculate from existing records or create default for today
      drawer = {
        id: `DRAWER-${today}`,
        date: today,
        time: '09:00:00 AM',
        openingCash: 50000,
        notes500: 0,
        notes200: 0,
        notes100: 0,
        notes50: 0,
        notes20: 0,
        notes10: 0,
        coinsTotal: 0,
        totalPhysicalCash: 0,
        digitalLedgerCash: 50000,
        discrepancy: -50000,
        notes: '',
        verifiedBy: STORE_INFO.adminName,
        verifiedAt: `${today} 09:00 AM`,
      };
      db.cashDrawer = drawer;
      writeDatabase(db);
    }

    res.json({ drawer });
  });

  // Save/Update denomination counts
  app.post('/api/cash-drawer', requireAuth, (req: Request, res: Response) => {
    const db = readDatabase();
    const body = req.body;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    const openingCash = Number(body.openingCash) || 0;
    const n500 = Number(body.notes500) || 0;
    const n200 = Number(body.notes200) || 0;
    const n100 = Number(body.notes100) || 0;
    const n50 = Number(body.notes50) || 0;
    const n20 = Number(body.notes20) || 0;
    const n10 = Number(body.notes10) || 0;
    const coins = Number(body.coinsTotal) || 0;

    const totalPhysical = n500 * 500 + n200 * 200 + n100 * 100 + n50 * 50 + n20 * 20 + n10 * 10 + coins;

    // Calculate today's cash ledger flow
    const todayTxs = (db.transactions || []).filter((t: any) => t.date === today && t.paymentMode === 'CASH');
    let cashIn = 0;
    let cashOut = 0;

    todayTxs.forEach((t: any) => {
      if (t.transactionType === 'inflow') {
        cashIn += t.amount + (t.customerCharge || 0);
      } else {
        cashOut += t.amount;
        // In AEPS withdrawal, shop gives cash to customer, so cash leaves drawer
      }
    });

    // Also deduct today's cash expenses
    const todayExp = (db.expenses || []).filter((e: any) => e.date === today && e.paymentMode === 'CASH');
    const cashExpenses = todayExp.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

    const digitalLedger = openingCash + cashIn - cashOut - cashExpenses;
    const discrepancy = totalPhysical - digitalLedger;

    const updatedDrawer = {
      id: `DRAWER-${today}`,
      date: today,
      time: now.toLocaleTimeString('en-IN', { hour12: true }),
      openingCash,
      notes500: n500,
      notes200: n200,
      notes100: n100,
      notes50: n50,
      notes20: n20,
      notes10: n10,
      coinsTotal: coins,
      totalPhysicalCash: totalPhysical,
      digitalLedgerCash: digitalLedger,
      discrepancy,
      notes: body.notes || '',
      verifiedBy: STORE_INFO.adminName,
      verifiedAt: now.toLocaleString('en-IN', { hour12: true }),
    };

    db.cashDrawer = updatedDrawer;
    writeDatabase(db);

    logAudit(
      'DRAWER_RECONCILIATION',
      `Physical Cash: ₹${totalPhysical} | Calculated Ledger: ₹${digitalLedger} | Discrepancy: ₹${discrepancy}`,
      discrepancy === 0 ? 'SUCCESS' : 'WARNING',
      req
    );

    res.json({ success: true, drawer: updatedDrawer });
  });

  // ===================== EXPENSES =====================

  app.get('/api/expenses', requireAuth, (req: Request, res: Response) => {
    const db = readDatabase();
    res.json({ expenses: db.expenses || [] });
  });

  app.post('/api/expenses', requireAuth, (req: Request, res: Response) => {
    const db = readDatabase();
    const body = req.body;
    const now = new Date();

    const newExp = {
      id: `EXP-${Date.now().toString().slice(-4)}`,
      date: body.date || now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-IN', { hour12: true }),
      title: body.title,
      category: body.category || 'OTHER',
      amount: Number(body.amount) || 0,
      paymentMode: body.paymentMode || 'CASH',
      notes: body.notes || '',
      recordedBy: STORE_INFO.adminName,
    };

    db.expenses = [newExp, ...(db.expenses || [])];
    writeDatabase(db);

    logAudit('EXPENSE_RECORDED', `Shop expense: ${newExp.title} (₹${newExp.amount})`, 'INFO', req);
    res.status(201).json({ success: true, expense: newExp });
  });

  app.delete('/api/expenses/:id', requireAuth, (req: Request, res: Response) => {
    const db = readDatabase();
    const { id } = req.params;
    db.expenses = db.expenses.filter((e: any) => e.id !== id);
    writeDatabase(db);
    logAudit('EXPENSE_DELETED', `Deleted expense ${id}`, 'INFO', req);
    res.json({ success: true });
  });

  // ===================== REPORTS & ANALYTICS =====================

  app.get('/api/reports/analytics', requireAuth, (req: Request, res: Response) => {
    const db = readDatabase();
    const txs = db.transactions || [];
    const expenses = db.expenses || [];
    const customers = db.customers || [];

    const today = new Date().toISOString().split('T')[0];
    const thisMonthPrefix = today.slice(0, 7); // YYYY-MM

    // Today's numbers
    const todayTxs = txs.filter((t: any) => t.date === today);
    const todayVolume = todayTxs.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
    const todayProfit = todayTxs.reduce((sum: number, t: any) => sum + (t.netProfit || 0), 0);
    const todayCommission = todayTxs.reduce((sum: number, t: any) => sum + (t.bankCommission || 0), 0);
    const todayCashInflow = todayTxs
      .filter((t: any) => t.transactionType === 'inflow' && t.paymentMode === 'CASH')
      .reduce((sum: number, t: any) => sum + t.amount + (t.customerCharge || 0), 0);
    const todayCashOutflow = todayTxs
      .filter((t: any) => t.transactionType === 'outflow' && t.paymentMode === 'CASH')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    // This Month's numbers
    const monthTxs = txs.filter((t: any) => t.date?.startsWith(thisMonthPrefix));
    const monthVolume = monthTxs.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
    const monthProfit = monthTxs.reduce((sum: number, t: any) => sum + (t.netProfit || 0), 0);
    const monthExpenses = expenses
      .filter((e: any) => e.date?.startsWith(thisMonthPrefix))
      .reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

    // Outstanding Udhar
    const totalMarketUdhar = customers.reduce((sum: number, c: any) => sum + (c.balanceDue > 0 ? c.balanceDue : 0), 0);
    const totalAdvanceJama = customers.reduce((sum: number, c: any) => sum + (c.balanceDue < 0 ? Math.abs(c.balanceDue) : 0), 0);

    // Service Breakdown
    const serviceMap: { [key: string]: { count: number; volume: number; profit: number } } = {};
    txs.forEach((t: any) => {
      const cat = t.serviceCategory || 'OTHER_SERVICE';
      if (!serviceMap[cat]) {
        serviceMap[cat] = { count: 0, volume: 0, profit: 0 };
      }
      serviceMap[cat].count += 1;
      serviceMap[cat].volume += t.amount || 0;
      serviceMap[cat].profit += t.netProfit || 0;
    });

    // Payment Mode Breakdown
    const paymentMap: { [key: string]: { count: number; volume: number } } = {};
    txs.forEach((t: any) => {
      const mode = t.paymentMode || 'CASH';
      if (!paymentMap[mode]) {
        paymentMap[mode] = { count: 0, volume: 0 };
      }
      paymentMap[mode].count += 1;
      paymentMap[mode].volume += t.amount || 0;
    });

    res.json({
      today: {
        volume: todayVolume,
        profit: todayProfit,
        commission: todayCommission,
        cashInflow: todayCashInflow,
        cashOutflow: todayCashOutflow,
        txCount: todayTxs.length,
      },
      thisMonth: {
        volume: monthVolume,
        grossProfit: monthProfit,
        expenses: monthExpenses,
        netProfit: monthProfit - monthExpenses,
        txCount: monthTxs.length,
      },
      khataSummary: {
        totalMarketUdhar,
        totalAdvanceJama,
        customerCount: customers.length,
      },
      serviceBreakdown: serviceMap,
      paymentBreakdown: paymentMap,
      storeInfo: STORE_INFO,
    });
  });

  // Export CSV endpoint
  app.get('/api/reports/export-csv', requireAuth, (req: Request, res: Response) => {
    const db = readDatabase();
    const txs = db.transactions || [];

    let csv = 'ID,Date,Time,Customer Name,Mobile,Service Category,Type,Amount (INR),Customer Charge,Commission,Net Profit,Payment Mode,Reference Number,Status\n';

    txs.forEach((t: any) => {
      const row = [
        `"${t.id}"`,
        `"${t.date}"`,
        `"${t.time}"`,
        `"${(t.customerName || '').replace(/"/g, '""')}"`,
        `"${t.customerMobile || ''}"`,
        `"${t.serviceCategory}"`,
        `"${t.transactionType}"`,
        t.amount || 0,
        t.customerCharge || 0,
        t.bankCommission || 0,
        t.netProfit || 0,
        `"${t.paymentMode}"`,
        `"${t.referenceNumber || ''}"`,
        `"${t.status}"`,
      ].join(',');
      csv += row + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=Mohammad_Faizan_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  });

  // ===================== VITE & STATIC MIDDLEWARE =====================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`[SERVER RUNNING] http://${HOST}:${PORT}`);
    console.log(`[STORE INFO] ${STORE_INFO.shopName} - Admin: ${STORE_INFO.adminName} (${STORE_INFO.mobile})`);
    console.log(`[SECURITY] 2FA Gmail: ${STORE_INFO.email} | Master Auth configured.`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
});
