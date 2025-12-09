// ─────────────────────────────────────────
// Authorization Object
// ─────────────────────────────────────────
export interface IPaystackAuthorization {
  authorization_code: string;
  bin: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  channel: string;
  card_type: string;
  bank: string;
  country_code: string;
  brand: string;
  reusable: boolean;
  signature: string;
  account_name: string | null;
}

// ─────────────────────────────────────────
// Customer Object
// ─────────────────────────────────────────
export interface IPaystackCustomer {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  customer_code: string;
  phone: string | null;
  metadata: object | null;
  risk_action: string;
  international_format_phone: string | null;
}

// ─────────────────────────────────────────
// Source Object
// ─────────────────────────────────────────
export interface IPaystackSource {
  type: string;
  source: string;
  entry_point: string;
  identifier: string | null;
}

// ─────────────────────────────────────────
// Main Webhook Data
// ─────────────────────────────────────────
export interface IPaystackWebhookData {
  id: number;
  domain: string;
  status: string;
  reference: string;
  amount: number;
  message: string | null;
  gateway_response: string;
  paid_at: string;
  created_at: string;
  channel: string;
  currency: string;
  ip_address: string;
  metadata: any;
  fees_breakdown: object | null;
  log: object | null;
  fees: number;
  fees_split: object | null;
  authorization: IPaystackAuthorization;
  customer: IPaystackCustomer;
  plan: any;
  subaccount: any;
  split: any;
  order_id: string | number | null;
  paidAt: string;
  requested_amount: number;
  pos_transaction_data: object | null;
  source: IPaystackSource;
}

// ─────────────────────────────────────────
// Full Webhook Body
// ─────────────────────────────────────────
export interface IPaystackWebhookInterface {
  event: string;
  data: IPaystackWebhookData;
}
