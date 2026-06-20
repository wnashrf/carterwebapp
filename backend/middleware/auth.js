// middleware/auth.js
const jwt = require('jsonwebtoken');
 
module.exports = (req, res, next) => {
  const header = req.headers.authorization;        // 'Bearer <token>'
  if (!header) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    req.userId = decoded.id;   // pass the user on to the controller
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
