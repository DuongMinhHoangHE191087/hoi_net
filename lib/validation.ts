import { z } from 'zod';

export const AIProcessingSchema = z.object({
  request_id: z.string().uuid({ message: "Invalid Request ID" }),
  images: z.array(z.string().url({ message: "Invalid Image URL" }))
    .min(1, { message: "At least one image is required" })
    .max(10, { message: "Maximum 10 images allowed per request" }),
  prompt: z.string().optional(),
  type: z.enum(['restore', 'enhance', 'colorize', 'upscale', 'harmonize']).default('restore'),
  options: z.object({
    temperature: z.number().min(0).max(1).optional(),
    model: z.enum(['gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-2.0-flash']).optional(),
    quality: z.enum(['standard', 'hd']).optional(),
    outputFormat: z.enum(['analysis_only', 'image_and_analysis']).optional()
  }).optional()
});

export type AIProcessingRequest = z.infer<typeof AIProcessingSchema>;

export const ApiKeyValidationSchema = z.object({
  apiKey: z.string().min(10, { message: "API Key too short" }).startsWith("AIza", { message: "Invalid API Key format" })
});

export const loginSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" })
});

export type LoginRequest = z.infer<typeof loginSchema>;

export const profileSchema = z.object({
  full_name: z.string().min(1, "Họ tên là bắt buộc"),
  phone: z.string().optional(),
  address: z.string().optional(),
  facebook_url: z.string().url("URL không hợp lệ").optional().or(z.literal('')),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const requestSchema = z.object({
  type: z.enum(['restore', 'family']),
  description: z.string().min(10, "Mô tả phải có ít nhất 10 ký tự").max(1000, "Mô tả tối đa 1000 ký tự"),
  images: z.union([
    z.array(z.any()).min(1, "Vui lòng chọn ít nhất 1 ảnh").max(5, "Tối đa 5 ảnh"),
    z.array(z.string().url()).min(1, "Vui lòng chọn ít nhất 1 ảnh").max(5, "Tối đa 5 ảnh")
  ]),
});

export const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .regex(/[a-z]/, "Phải chứa ít nhất 1 chữ thường")
    .regex(/[A-Z]/, "Phải chứa ít nhất 1 chữ hoa")
    .regex(/[0-9]/, "Phải chứa ít nhất 1 số"),
  confirmPassword: z.string(),
  fullName: z.string().optional(),
  agreeTerms: z.boolean().refine(val => val === true, "Bạn phải đồng ý với điều khoản sử dụng"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Blog Post Schema
export const blogPostSchema = z.object({
  title: z.string()
    .min(5, "Tiêu đề phải có ít nhất 5 ký tự")
    .max(200, "Tiêu đề tối đa 200 ký tự"),
  slug: z.string()
    .min(3, "Slug phải có ít nhất 3 ký tự")
    .max(200, "Slug tối đa 200 ký tự")
    .regex(/^[a-z0-9-]+$/, "Slug chỉ chứa chữ thường, số và dấu gạch ngang"),
  excerpt: z.string()
    .min(10, "Tóm tắt phải có ít nhất 10 ký tự")
    .max(500, "Tóm tắt tối đa 500 ký tự"),
  content: z.string()
    .min(50, "Nội dung phải có ít nhất 50 ký tự"),
  author_name: z.string()
    .min(2, "Tên tác giả phải có ít nhất 2 ký tự")
    .max(100, "Tên tác giả tối đa 100 ký tự"),
  featured_image: z.string().url("URL ảnh không hợp lệ").optional().or(z.literal('')),
  published: z.boolean().default(false),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;


