import { request } from "@/apis";
import type { RequestType } from "@/types";

import urls from "./urls";


const apis = {
  login: ({data}: RequestType) => 
    request({
      method: "POST",
      url: urls.login,
      data
    }),
  registerClient: ({data}: RequestType) =>
    request({
      method: "POST",
      url: urls.registerClient,
      data
    }),
  registerFreelancer: ({data}: RequestType) => 
    request({
      method: "POST",
      url: urls.registerFreelancer,
      data
    })
}

export default apis;