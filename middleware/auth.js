import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ success: false, msg: 'No token' });

  const token = auth.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, msg: 'Invalid token' });

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
    if (err) return res.status(401).json({ success: false, msg: 'Token invalid' });
    req.user = decoded;
    next();
  });
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, msg: 'No user' });
    if (req.user.role !== role) return res.status(403).json({ success: false, msg: 'Forbidden' });
    next();
  };
}
