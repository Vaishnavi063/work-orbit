import { request } from "@/apis";
import urls from "./urls";

// Add new interfaces
interface AddMoneyOrderRequest {
  userId: number;
  role: string;
  amount: number;
}

interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  userId: number;
  role: string;
  amount: number;
}

const apis = {
  getFrozanAmount: ({ authToken, id }: { authToken: string; id: number }) =>
    request({
      method: "GET",
      url: `${urls.getFrozenAmounts}/${id}`,
      authToken,
    }),

  getWalletDetails: ({
    params,
    authToken,
    id,
  }: {
    params: any;
    authToken: string;
    id: number;
  }) =>
    request({
      method: "GET",
      authToken,
      url: `${urls.getWalletDetails}/${id}`,
      params: params,
    }),

  createAddMoneyOrder: ({ 
    data, 
    authToken 
  }: { 
    data: AddMoneyOrderRequest; 
    authToken: string; 
  }) =>
    request({
      method: "POST",
      data,
      authToken,
      url: urls.addMoney,
    }),

  verifyPayment: ({ 
    data, 
    authToken 
  }: { 
    data: VerifyPaymentRequest; 
    authToken: string; 
  }) =>
    request({
      method: "POST",
      data,
      authToken,
      url: urls.verifyPayment,
    }),
};

export default apis;
export type { AddMoneyOrderRequest, VerifyPaymentRequest };