import { z } from 'zod';

export const checkoutSchema = z.object({
  // Customer Information
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
  company: z.string().optional(),

  // Billing Address
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State/Province is required'),
  zipCode: z.string().min(3, 'ZIP/Postal code is required'),
  country: z.string().min(2, 'Country is required'),

  // Terms
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
  subscribeNewsletter: z.boolean().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
