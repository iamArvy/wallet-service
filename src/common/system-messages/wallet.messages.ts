export const PAYMENT_INITIATED = 'payment initiated';
export const WALLET_NOT_FOUND = 'wallet not found';
export const TRANSACTION_NOT_FOUND = 'transaction not found';
export const INVALID_REQUEST = 'invalid request';
export const UNHANDLED_WEBHOOK_EVENT = (event: string) =>
  `Unhandled webhook event: ${event}`;
export const TRANSACTION_NOT_FOUND_FOR_REFERENCE = (ref: string) =>
  `Transaction not found for reference: ${ref}`;
export const DUPLICATE_WEBHOOK_RECEIVED = (ref: string) =>
  `Duplicate webhook received — transaction already processed: ${ref}`;
export const CHARGE_SUCCESS_STATUS_NOT_SUCCESS = (ref: string) =>
  `Status is not success for reference ${ref}`;
export const WEBHOOK_PROCESSED_SUCCESSFULLY = (ref: string) =>
  `Transaction processed successfully: ${ref}`;
export const RECIPIENT_WALLET_NOT_FOUND = 'recipient wallet not found';
export const INSUFFICIENT_BALANCE = 'insufficient balance';
export const TRANSFER_COMPLETED = 'transfer completed';
