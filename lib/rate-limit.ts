import { NextRequest } from "next/server";

export class RateLimiter {
  private cache = new Map<string, { count: number; expiresAt: number }>();
  private limit: number;
  private windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  check(identifier: string): { success: boolean; limit: number; remaining: number } {
    const now = Date.now();
    const record = this.cache.get(identifier);

    // Limpieza periódica suave para evitar fugas de memoria
    if (Math.random() < 0.05) this.cleanup();

    if (!record || record.expiresAt < now) {
      this.cache.set(identifier, { count: 1, expiresAt: now + this.windowMs });
      return { success: true, limit: this.limit, remaining: this.limit - 1 };
    }

    if (record.count >= this.limit) {
      return { success: false, limit: this.limit, remaining: 0 };
    }

    record.count += 1;
    this.cache.set(identifier, record);
    return { success: true, limit: this.limit, remaining: this.limit - record.count };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (value.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }
}

// Helper to easily get an IP address from NextRequest
export function getIP(req: NextRequest) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  return forwardedFor?.split(",")[0] ?? realIp ?? "unknown-ip";
}
