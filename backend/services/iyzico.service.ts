// ClawPazar – iyzico Marketplace Payment Service
// Handles sub-merchant CRUD, escrow payments, webhooks, and payouts
// Docs: https://dev.iyzipay.com/

import crypto from 'crypto';

// ============================================================
// TYPES
// ============================================================

interface IyzicoConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string; // sandbox: https://sandbox-api.iyzipay.com | prod: https://api.iyzipay.com
}

interface SubMerchant {
  conversationId: string;
  subMerchantExternalId: string;
  subMerchantType: 'PERSONAL' | 'PRIVATE_COMPANY' | 'LIMITED_OR_JOINT_STOCK_COMPANY';
  address: string;
  email: string;
  gsmNumber: string;
  name: string;
  iban: string;
  currency: 'TRY';
  // PERSONAL
  identityNumber?: string;
  // COMPANY
  taxNumber?: string;
  taxOffice?: string;
  legalCompanyTitle?: string;
}

interface SubMerchantResponse {
  status: 'success' | 'failure';
  subMerchantKey: string;
  errorCode?: string;
  errorMessage?: string;
}

interface PaymentItem {
  id: string;
  name: string;
  category1: string;
  category2?: string;
  itemType: 'PHYSICAL';
  price: string;        // item price
  subMerchantKey: string;
  subMerchantPrice: string; // seller payout amount
}

interface PaymentRequest {
  conversationId: string;
  price: string;
  paidPrice: string;
  currency: 'TRY';
  installment: number;
  paymentChannel: 'WEB' | 'MOBILE';
  paymentGroup: 'PRODUCT'; // PRODUCT = escrow enabled
  paymentCard: {
    cardHolderName: string;
    cardNumber: string;
    expireMonth: string;
    expireYear: string;
    cvc: string;
    registerCard?: number;
  };
  buyer: {
    id: string;
    name: string;
    surname: string;
    gsmNumber: string;
    email: string;
    identityNumber: string;
    registrationAddress: string;
    ip: string;
    city: string;
    country: string;
  };
  shippingAddress: Address;
  billingAddress: Address;
  basketItems: PaymentItem[];
  callbackUrl?: string; // for 3D Secure
}

interface Address {
  contactName: string;
  city: string;
  country: string;
  address: string;
}

interface WebhookPayload {
  iyziEventType: string;
  iyziEventTime: number;
  token: string;
  paymentConversationId: string;
  status: string;
  merchantId: number;
}

interface EscrowApproval {
  paymentTransactionId: string;
}

// ============================================================
// IYZICO SERVICE
// ============================================================

export class IyzicoService {
  private config: IyzicoConfig;

  constructor(config: IyzicoConfig) {
    this.config = config;
  }

  // ----------------------------------------------------------
  // AUTH: Generate iyzico authorization header
  // ----------------------------------------------------------
  private generateAuthHeader(uri: string, body: string): Record<string, string> {
    const randomStr = Date.now().toString() + Math.random().toString(36).substring(2);
    const hashStr = this.config.apiKey + randomStr + this.config.secretKey + body;
    const pkiHash = crypto.createHash('sha1').update(hashStr).digest('base64');
    
    const authorizationValue = `IYZWS ${this.config.apiKey}:${pkiHash}`;

    return {
      'Authorization': authorizationValue,
      'x-iyzi-rnd': randomStr,
      'Content-Type': 'application/json',
    };
  }

  // ----------------------------------------------------------
  // HTTP helper
  // ----------------------------------------------------------
  private async request<T>(method: string, path: string, body?: object): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;
    const bodyStr = body ? JSON.stringify(body) : '';
    const headers = this.generateAuthHeader(path, bodyStr);

    const response = await fetch(url, {
      method,
      headers,
      body: bodyStr || undefined,
    });

    const data = await response.json() as T;
    return data;
  }

  // ----------------------------------------------------------
  // 1. SUB-MERCHANT MANAGEMENT
  // ----------------------------------------------------------

  /**
   * Register a new sub-merchant (seller) with iyzico.
   * Must be called after KYC verification.
   */
  async createSubMerchant(merchant: SubMerchant): Promise<SubMerchantResponse> {
    return this.request<SubMerchantResponse>('POST', '/onboarding/submerchant', {
      locale: 'tr',
      conversationId: merchant.conversationId,
      subMerchantExternalId: merchant.subMerchantExternalId,
      subMerchantType: merchant.subMerchantType,
      address: merchant.address,
      email: merchant.email,
      gsmNumber: merchant.gsmNumber,
      name: merchant.name,
      iban: merchant.iban,
      currency: merchant.currency,
      identityNumber: merchant.identityNumber,
      taxNumber: merchant.taxNumber,
      taxOffice: merchant.taxOffice,
      legalCompanyTitle: merchant.legalCompanyTitle,
    });
  }

  /**
   * Update existing sub-merchant details.
   */
  async updateSubMerchant(
    subMerchantKey: string,
    updates: Partial<SubMerchant>
  ): Promise<SubMerchantResponse> {
    return this.request<SubMerchantResponse>('PUT', '/onboarding/submerchant', {
      locale: 'tr',
      subMerchantKey,
      ...updates,
    });
  }

  /**
   * Retrieve sub-merchant details.
   */
  async getSubMerchant(subMerchantKey: string): Promise<SubMerchantResponse> {
    return this.request<SubMerchantResponse>('POST', '/onboarding/submerchant/detail', {
      locale: 'tr',
      subMerchantKey,
    });
  }

  // ----------------------------------------------------------
  // 2. ESCROW PAYMENT (3D Secure)
  // ----------------------------------------------------------

  /**
   * Initialize a 3D Secure payment with escrow (PRODUCT payment group).
   * Funds are held by iyzico until escrow approval.
   */
  async initializeThreeDSPayment(request: PaymentRequest): Promise<{
    status: string;
    threeDSHtmlContent: string; // base64 encoded HTML to render in iframe
    paymentId: string;
    conversationId: string;
  }> {
    return this.request('POST', '/payment/3dsecure/initialize', {
      locale: 'tr',
      ...request,
    });
  }

  /**
   * Complete 3D Secure payment after bank callback.
   */
  async completeThreeDSPayment(paymentId: string): Promise<{
    status: string;
    paymentId: string;
    price: number;
    paidPrice: number;
    paymentStatus: string;
    fraudStatus: number; // 1=approve, -1=reject, 0=pending
    itemTransactions: Array<{
      paymentTransactionId: string;
      subMerchantKey: string;
      subMerchantPrice: number;
    }>;
  }> {
    return this.request('POST', '/payment/3dsecure/auth', {
      locale: 'tr',
      paymentId,
    });
  }

  /**
   * Non-3D payment (only for testing in sandbox).
   */
  async createPayment(request: PaymentRequest): Promise<{
    status: string;
    paymentId: string;
    fraudStatus: number;
    itemTransactions: Array<{
      paymentTransactionId: string;
      subMerchantKey: string;
      subMerchantPrice: number;
    }>;
  }> {
    return this.request('POST', '/payment/auth', {
      locale: 'tr',
      ...request,
    });
  }

  // ----------------------------------------------------------
  // 3. ESCROW APPROVAL (Release funds to seller)
  // ----------------------------------------------------------

  /**
   * Approve escrow release after buyer confirms delivery.
   * This releases the sub-merchant's funds.
   */
  async approveEscrow(paymentTransactionId: string): Promise<{
    status: string;
    paymentTransactionId: string;
  }> {
    return this.request('POST', '/payment/iyzipos/item/approve', {
      locale: 'tr',
      paymentTransactionId,
    });
  }

  /**
   * Disapprove/cancel escrow (initiate refund).
   */
  async disapproveEscrow(paymentTransactionId: string): Promise<{
    status: string;
    paymentTransactionId: string;
  }> {
    return this.request('POST', '/payment/iyzipos/item/disapprove', {
      locale: 'tr',
      paymentTransactionId,
    });
  }

  // ----------------------------------------------------------
  // 4. REFUND
  // ----------------------------------------------------------

  /**
   * Full or partial refund.
   */
  async refund(
    paymentTransactionId: string,
    price: string,
    conversationId: string,
    ip: string
  ): Promise<{
    status: string;
    paymentTransactionId: string;
    price: number;
  }> {
    return this.request('POST', '/payment/refund', {
      locale: 'tr',
      conversationId,
      paymentTransactionId,
      price,
      ip,
    });
  }

  // ----------------------------------------------------------
  // 5. WEBHOOK VERIFICATION
  // ----------------------------------------------------------

  /**
   * Verify iyzico webhook HMAC signature.
   * iyzico sends webhooks via POST with HMAC-SHA256 signature.
   */
  verifyWebhookSignature(
    payload: string,
    signature: string
  ): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.config.secretKey)
      .update(payload)
      .digest('hex');

    // Timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Process incoming webhook with idempotency check.
   */
  async processWebhook(
    payload: WebhookPayload,
    rawBody: string,
    signature: string,
    processedIds: Set<string> // simple in-memory; use Redis/DB in production
  ): Promise<{
    success: boolean;
    action: string;
    conversationId: string;
  }> {
    // 1. Verify signature
    if (!this.verifyWebhookSignature(rawBody, signature)) {
      throw new Error('Invalid webhook signature');
    }

    // 2. Idempotency check
    const idempotencyKey = `${payload.paymentConversationId}:${payload.iyziEventType}`;
    if (processedIds.has(idempotencyKey)) {
      return {
        success: true,
        action: 'already_processed',
        conversationId: payload.paymentConversationId,
      };
    }

    // 3. Process based on event type
    let action = 'unknown';
    switch (payload.iyziEventType) {
      case 'CREDIT_PAYMENT_AUTH':
        action = 'payment_authorized';
        break;
      case 'CREDIT_PAYMENT_CAPTURE':
        action = 'payment_captured';
        break;
      case 'REFUND':
        action = 'payment_refunded';
        break;
      case 'CANCEL':
        action = 'payment_cancelled';
        break;
      default:
        action = `unhandled_${payload.iyziEventType}`;
    }

    // 4. Mark as processed
    processedIds.add(idempotencyKey);

    return {
      success: true,
      action,
      conversationId: payload.paymentConversationId,
    };
  }

  // ----------------------------------------------------------
  // 6. COMMISSION CALCULATOR
  // ----------------------------------------------------------

  /**
   * Calculate platform fee and seller payout.
   * Platform takes commission_rate% from the sale price.
   */
  static calculateCommission(
    itemPrice: number,
    commissionRate: number = 0.05 // 5% default
  ): {
    platformFee: number;
    sellerPayout: number;
    iyzicoCommission: number; // estimated 2.49% + 0.25 TL
  } {
    const platformFee = Math.round(itemPrice * commissionRate * 100) / 100;
    const iyzicoCommission = Math.round((itemPrice * 0.0249 + 0.25) * 100) / 100;
    const sellerPayout = Math.round((itemPrice - platformFee) * 100) / 100;

    return {
      platformFee,
      sellerPayout,
      iyzicoCommission,
    };
  }
}

// ============================================================
// FACTORY: Create configured iyzico service
// ============================================================

export function createIyzicoService(): IyzicoService {
  return new IyzicoService({
    apiKey: process.env.IYZICO_API_KEY || '',
    secretKey: process.env.IYZICO_SECRET_KEY || '',
    baseUrl: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
  });
}
