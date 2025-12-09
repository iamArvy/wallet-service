interface LogHistory {
  type: string;
  message: string;
  time: number;
}

interface Log {
  start_time: number;
  time_spent: number;
  attempts: number;
  errors: number;
  success: boolean;
  mobile: boolean;
  input: any[];
  history: LogHistory[];
}

interface Authorization {
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
  account_name?: string | null;
}

interface Customer {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  customer_code: string;
  phone?: string | null;
  metadata?: any;
  risk_action: string;
  international_format_phone?: string | null;
}

export interface PaymentData {
  id: number;
  domain: string;
  status: string;
  reference: string;
  receipt_number?: string | null;
  amount: number;
  message?: string | null;
  gateway_response: string;
  paid_at: string;
  created_at: string;
  channel: string;
  currency: string;
  ip_address: string;
  metadata?: any;
  log: Log;
  fees: number;
  fees_split?: any;
  authorization: Authorization;
  customer: Customer;
  plan?: any;
  split?: any;
  order_id?: any;
  paidAt: string;
  createdAt: string;
  requested_amount: number;
  pos_transaction_data?: any;
  source?: any;
  fees_breakdown?: any;
  connect?: any;
  transaction_date: string;
  plan_object?: any;
  subaccount?: any;
}

export interface IVerifyPaymentResponse {
  status: boolean;
  message: string;
  data: PaymentData;
}
