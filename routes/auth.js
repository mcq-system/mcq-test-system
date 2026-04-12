const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

// ─── Page Routes ──────────────────────────────────────────────────────────────
router.get('/login', authController.getLogin);
router.get('/register', authController.getRegister);

// ─── Action Routes ────────────────────────────────────────────────────────────
router.post('/login', authController.postLogin);
router.post('/register', authController.postRegister);

module.exports = router;
