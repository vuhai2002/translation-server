const express = require('express');
const router = express.Router();

// Simple health check endpoint
router.get('/', (req, res) => {
  // Liveness only: no DB/auth/upstream. no-store so no proxy serves a stale 200.
  res.set('Cache-Control', 'no-store');
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
