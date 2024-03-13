const loginLimiter = require('../middleware/loginlimiter')
const authController = require('../Controllers/authController') ;
const express = require('express');
const router = express.Router();

router.route('/')
    .post(loginLimiter, authController.login)

router.route('/refresh')
    .get(authController.refresh)

router.route('/logout')
    .post(authController.logout)

module.exports = router;