// Vercel Serverless Function - Must import app AFTER all setup
const app = require('../server');

// Export handler for Vercel
module.exports = (req, res) => {
  // Ensure proper URL handling
  const url = req.url || '/';
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${url}`);
  
  return app(req, res);
};
