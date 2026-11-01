import type { Request, Response, NextFunction } from 'express';

// In-memory rate limiting store for brute-force protection
interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.blockedUntil && entry.blockedUntil < now) {
      rateLimitStore.delete(key);
    } else if (now - entry.firstAttempt > 15 * 60 * 1000) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function authRateLimiter(maxAttempts = 10, windowMs = 15 * 60 * 1000, blockDurationMs = 15 * 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `rl_${req.path}_${ip}`;
    const now = Date.now();

    const entry = rateLimitStore.get(key);

    if (entry) {
      // If currently blocked
      if (entry.blockedUntil && entry.blockedUntil > now) {
        const remainingSec = Math.ceil((entry.blockedUntil - now) / 1000);
        res.status(429).json({
          success: false,
          message: `Trop de tentatives. Pour votre sécurité, l'accès est temporairement bloqué. Réessayez dans ${remainingSec} secondes.`,
        });
        return;
      }

      // Check if window has expired
      if (now - entry.firstAttempt > windowMs) {
        rateLimitStore.set(key, { count: 1, firstAttempt: now });
        next();
        return;
      }

      entry.count += 1;

      // Check if exceeded max attempts
      if (entry.count > maxAttempts) {
        entry.blockedUntil = now + blockDurationMs;
        res.status(429).json({
          success: false,
          message: `Protection Anti-Attaque : Nombre maximal de tentatives atteint. Blocage de sécurité actif pour ${Math.ceil(blockDurationMs / 60000)} minutes.`,
        });
        return;
      }
    } else {
      rateLimitStore.set(key, { count: 1, firstAttempt: now });
    }

    next();
  };
}

// Input sanitizer to prevent NoSQL Injection and XSS characters
export function sanitizeInput(req: Request, res: Response, next: NextFunction): void {
  const sanitizeObject = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;

    for (const key of Object.keys(obj)) {
      // Prevent MongoDB operator injection (keys starting with $)
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
        continue;
      }

      if (typeof obj[key] === 'string') {
        // Strip potential script injections while keeping normal unicode text
        obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      } else if (typeof obj[key] === 'object') {
        sanitizeObject(obj[key]);
      }
    }
    return obj;
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);

  next();
}
