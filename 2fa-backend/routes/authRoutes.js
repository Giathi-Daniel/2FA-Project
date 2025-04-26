const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const validateRequest = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

// Protected route 
// router.get('/profile', authMiddleware.protect, (req, res) => {
//   res.json(req.user);
// });

// Routes with validation middleware
router.post(
  '/register',
  csrfProtection,
  [
    check('email').isEmail().normalizeEmail(),
    check('password').isLength({ min: 8 })
  ],
  validateRequest,
  authController.register
);

router.post(
  '/login',
  csrfProtection,
  [
    check('email').isEmail().normalizeEmail(),
    check('password').exists()
  ],
  validateRequest,
  authController.login
);

router.post(
  '/forgot-password',
  csrfProtection,
  [check('email').isEmail().normalizeEmail()],
  validateRequest,
  authController.forgotPassword
);

router.put(
  '/reset-password/:token',
  [check('password').isLength({ min: 8 })],
  validateRequest,
  authController.resetPassword
);