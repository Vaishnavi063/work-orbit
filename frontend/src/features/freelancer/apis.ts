import { request } from "@/apis";
import type { RequestType } from "@/types";

import urls from "./urls";

const apis = {
  getProjects: ({ authToken }: RequestType) =>
    request({
      method: "GET",
      url: urls.getProjects,
      authToken,
    }),
  getProjectDetails: ({ authToken, id }: { authToken: string; id: string }) =>
    request({
      method: "GET",
      url: `${urls.getProjectDetails}/${id}`,
      authToken,
    }),
  getProjectBids: ({ authToken, id }: { authToken: string; id: string }) =>
    request({
      method: "GET",
      url: `${urls.getProjectBids}/${id}`,
      authToken,
    }),
  raiseBid: ({ data, authToken }: RequestType) =>
    request({
      method: "POST",
      url: urls.raiseBid,
      authToken,
      data,
    }),
  getFreelancerBids: ({ authToken, id }: { authToken: string; id: string }) =>
    request({
      method: "GET",
      url: `${urls.getFreelancerBids}/${id}`,
      authToken,
    }),

  deleteBid: ({
    authToken,
    freelancerId,
    bidId,
  }: {
    authToken: string;
    freelancerId: string;
    bidId: string;
  }) =>
    request({
      method: "DELETE",
      url: `${urls.deleteBid}/${bidId}/freelancer/${freelancerId}`,
      authToken,
    }),
};

export default apis;
