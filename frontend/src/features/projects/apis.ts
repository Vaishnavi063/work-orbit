import { request } from "@/apis";
import type { RequestType } from "@/types";

import urls from "./urls";

const apis = {
  createProject: ({ data, authToken }: RequestType) =>
    request({
      method: "POST",
      url: urls.createProject,
      data,
      authToken
    }),
  
  getProjects: ({ authToken }: RequestType) =>
    request({
      method: "GET",
      url: urls.getProjects,
      authToken
    }),
  
  getProjectById: ({ params, authToken }: RequestType) =>
    request({
      method: "GET",
      url: `${urls.getProject}/${params.id}`,
      authToken
    }),
  
  getProjectBids: ({ params, authToken }: RequestType) =>
    request({
      method: "GET",
      url: `${urls.getProjectBids}/${params.projectId}`,
      authToken
    }),
  
  acceptBid: ({ params, authToken }: RequestType) =>
    request({
      method: "PUT",
      url: `${urls.acceptBid}/${params.projectId}/bids/${params.bidId}/accept`,
      authToken
    }),
  
  rejectBid: ({ params, authToken }: RequestType) =>
    request({
      method: "PUT",
      url: `${urls.rejectBid}/${params.projectId}/bids/${params.bidId}/reject`,
      authToken
    }),
  
  updateProject: ({ params, data, authToken }: RequestType) =>
    request({
      method: "PUT",
      url: `${urls.updateProject}/${params.id}`,
      data,
      authToken
    }),
  
  deleteProject: ({ params, authToken }: RequestType) =>
    request({
      method: "DELETE",
      url: `${urls.deleteProject}/${params.id}`,
      authToken
    })
};

export default apis;