import { NextFunction, Request, Response } from 'express';
import { STATUS_CODES } from 'http';

/** Incluye errores rechazados por guards, antes de llegar al controlador. */
export function logHttpErrors(req: Request, res: Response, next: NextFunction): void {
  const started = Date.now();
  // Omitir query strings, cabeceras y cuerpos que podrían contener credenciales.
  const path = req.originalUrl.split('?')[0].replace(/[\r\n]/g, '');
  res.once('finish', () => {
    if (res.statusCode < 400) return;
    const message = `[HTTP] ${req.method} ${path} → ${res.statusCode} ${STATUS_CODES[res.statusCode] || ''} (${Date.now() - started} ms)`;
    if (res.statusCode >= 500) console.error(message);
    else console.warn(message);
  });
  next();
}
