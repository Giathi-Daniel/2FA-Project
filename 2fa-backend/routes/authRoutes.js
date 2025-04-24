const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');

router.post(
  '/register',
  [
    check('email').isEmail().normalizeEmail(),
    check('password').isLength({ min: 8 })
  ],
  authController.register
);

router.post(
  '/verify',
  [
    check('email').isEmail().normalizeEmail(),
    check('otp').isLength({ min: 6, max: 6 })
  ],
  authController.verifyOTP
);

module.exports = router;