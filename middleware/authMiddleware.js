const jwt = require('jsonwebtoken');
const BlacklistedToken = require('./blacklistedToken');

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    
    const isBlacklisted = await BlacklistedToken.exists({ token });
    if (isBlacklisted) {
      return res.status(401).json({ message: 'Token is blacklisted' });
    }

    
    jwt.verify(token, process.env.JWT_SECRET, (err, userId) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }
      req.userId = userId;
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = authenticateToken;
