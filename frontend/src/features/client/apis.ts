import { request } from "@/apis";

import urls from "./urls";

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
};

export default apis;
