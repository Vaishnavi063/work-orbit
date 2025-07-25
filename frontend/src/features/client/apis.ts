import { request } from "@/apis";

import urls from "./urls";

// apis/index.ts (add this to your existing apis object)
const apis = {
  getClientProjects: ({ authToken, id }: { authToken: string; id: string }) =>
    request({
      method: "GET",
      url: `${urls.getClientProjects}/${id}`,
      authToken,
    }),

  deleteProject: ({ authToken, id }: { authToken: string; id: string }) =>
    request({
      method: "DELETE",
      url: `${urls.deleteProject}/${id}`,
      authToken,
    }),

  updateProject: ({
    authToken,
    id,
    data,
  }: {
    authToken: string;
    id: string;
    data: any;
  }) =>
    request({
      method: "PUT", 
      url: `${urls.updateProject}/${id}`,
      authToken,
      data,
    }),
};


export default apis;
