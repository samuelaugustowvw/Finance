import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
    userId?: string
}

export function authGuard(req: AuthRequest, res: Response, next: NextFunction) {
    const auth = req.headers.authorization
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token não fornecido' })
    }
    const token = auth.split(' ')[1]
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string }
        req.userId = decoded.userId
        next()
    } catch {
        return res.status(401).json({ error: 'Token inválido' })
    }
}