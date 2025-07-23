import type { RequestType } from "@/types";
import axios from "axios";

const request = ({
  method = "GET",
  authToken = null,
  data = {},
  params = null,
  url,
  isFormData = false,
  isPlainText = false,
}: RequestType & { isPlainText?: boolean }) => {
  const headers: Record<string, string> = {};
  
  // Set content type based on the request type
  if (isFormData) {
    headers["Content-Type"] = "multipart/form-data";
  } else if (isPlainText) {
    headers["Content-Type"] = "text/plain";
  } else {
    headers["Content-Type"] = "application/json";
  }
  
  // Add auth token if provided
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  
  return axios({
    baseURL: import.meta.env.VITE_BASE_URL,
    method,
    headers,
    data,
    params,
    url,
  });
};

export default request;
