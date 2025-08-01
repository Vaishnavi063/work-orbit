import request from "./request";
import type { ContactRequest, ContactResponse } from "@/types/contact";

/**
 * Submit a contact form request
 * @param contactData - The contact form data to submit
 * @param authToken - Optional auth token for logged-in users
 * @returns Promise with the contact response
 */
export const submitContactForm = async (
  contactData: ContactRequest,
  authToken?: string | null
): Promise<ContactResponse> => {
  const response = await request({
    method: "POST",
    url: "/api/contact",
    data: contactData,
    authToken,
  });

  return response.data;
};

