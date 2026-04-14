const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const { protect } = require('../middleware/auth');

// ─── Page Routes ──────────────────────────────────────────────────────────────
router.get('/login', authController.getLogin);
router.get('/register', authController.getRegister);
router.get('/profile', protect(), authController.getProfile);

// ─── Action Routes ────────────────────────────────────────────────────────────
router.post('/login', authController.postLogin);
router.post('/register', authController.postRegister);
router.post('/logout', authController.postLogout);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/me', protect(), authController.getMe);
router.patch('/change-password', protect(), authController.updatePassword);

module.exports = router;
