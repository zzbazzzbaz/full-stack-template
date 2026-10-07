import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().default(""),
});

export const { VITE_API_BASE_URL: API_BASE_URL } = envSchema.parse(import.meta.env);
