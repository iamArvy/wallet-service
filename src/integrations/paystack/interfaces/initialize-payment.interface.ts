export interface IInitializePaymentResponseData {
  reference: string;
  access: string;
  authorization_url: string;
}

export interface IInitializePaymentResponse {
  data: IInitializePaymentResponseData;
}
