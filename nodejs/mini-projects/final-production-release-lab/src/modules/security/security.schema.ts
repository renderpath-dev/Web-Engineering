import { z } from "zod";

export const scanSecretBodySchema = z.object({
  text: z.string().max(20_000),
  filePath: z.string().min(1).max(300).default("request-body.txt")
});

export type ScanSecretBody = z.infer<typeof scanSecretBodySchema>;
