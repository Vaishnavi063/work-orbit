import { z } from "zod";

// Contact form data interface
export interface ContactFormData {
  email: string;
  subject: string;
  message: string;
  userType: 'LOGGED_IN' | 'GUEST';
}

// Contact request interface for API
export interface ContactRequest {
  email: string;
  subject: string;
  message: string;
  userType: 'LOGGED_IN' | 'GUEST';
  userId?: number;
  submittedAt: Date;
}

// Contact response interface from API
export interface ContactResponse {
  id: number;
  status: 'received' | 'processing' | 'resolved';
  confirmationSent: boolean;
  createdAt: Date;
}

// Contact form modal props
export interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

// Zod validation schemas
export const contactFormSchema = z.object({
  email: z
    .email("Please enter a valid email address"),
  subject: z
    .string()
    .min(3, "Subject must be at least 3 characters")
    .max(100, "Subject must be less than 100 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be less than 1000 characters"),
  userType: z
    .enum(['LOGGED_IN', 'GUEST']),
});

export type ContactFormSchema = z.infer<typeof contactFormSchema>;

// API request schema for backend validation
export const contactRequestSchema = z.object({
  email: z.email(),
  subject: z.string().min(3).max(100),
  message: z.string().min(10).max(1000),
  userType: z.enum(['LOGGED_IN', 'GUEST']),
  userId: z.number().optional(),
});

export type ContactRequestSchema = z.infer<typeof contactRequestSchema>;