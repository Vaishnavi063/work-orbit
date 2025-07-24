import { request } from "@/apis";
import urls from "./urls";


const apis = {
  getRevenue: ({ authToken, id }: { authToken: string; id: number }) =>
    request({
      method: "GET",
      url: `${urls.getRevenue}/${id}`,
      authToken,
    }),
}

export default apis