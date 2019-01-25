const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const token = req.header('authorization');
  if (!token)
    return res.status(401).json({ error: 'Unauthorized. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.APP_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};
