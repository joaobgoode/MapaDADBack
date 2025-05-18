const jwt = require('jsonwebtoken');
const User = require('../models/user.model.js');

const JWT_SECRET = process.env.JWT_SECRET

const checkAdminOrSuperuserJwt = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'Authorization token required.' });
  }

  jwt.verify(token, JWT_SECRET, async (err, payload) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }

    try {
      const userId = payload.id;

      if (!userId) {
        return res.status(403).json({ message: 'Token payload missing user ID.' });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const userRole = user.role;

      if (userRole === 'admin' || userRole === 'superuser') {
        req.user = user;
        next();
      } else {
        return res.status(403).json({ message: 'Access denied. Requires admin or superuser role.' });
      }

    } catch (dbErr) {
      console.error(dbErr);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  });
};

module.exports = checkAdminOrSuperuserJwt;
