import { Request, Response, NextFunction } from 'express';

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): Response {
    console.error('❌ Error handler:', err);
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return res.status(500).json({ error: message });
}
