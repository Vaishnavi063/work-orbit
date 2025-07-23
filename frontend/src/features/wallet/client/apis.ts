import { request } from "@/apis";
import type { RequestType } from "@/types";
import urls from "./urls";

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

  addMoney: ({ data, authToken }: RequestType) =>
    request({
      data,
      authToken,
      url: urls.addMoney
    }),
};

export default apis;
