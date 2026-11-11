import jwt from 'jsonwebtoken'
export function requireAdmin(req, res, next) {
  try {
    const token = req.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (!token) return res.status(401).json({ message: 'Admin sign-in required' })
    req.admin = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch { return res.status(401).json({ message: 'Session expired. Sign in again.' }) }
}
