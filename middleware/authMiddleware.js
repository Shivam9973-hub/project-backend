const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Token Invalid' });
      }
      req.user = decoded;
      next();
    });
  } else {
    res.status(401).json({ message: 'Not Authorized, Token Required' });
  }
};

module.exports = { protect };
