import { request } from "@/apis";
import urls from "./urls";
import type { RequestType } from "@/types";


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