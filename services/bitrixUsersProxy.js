// Proxy para buscar usuários do Bitrix24
const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// POST /api/bitrix-users
router.post('/bitrix-users', async (req, res) => {
  try {
    const url = 'https://agroserra.bitrix24.com.br/rest/215/tvr0gkuvjdkc2oxn/user.get';
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body || {})
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
