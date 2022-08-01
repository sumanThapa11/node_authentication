import express from 'express';
const router = express.Router();

import UserController from '../controllers/userController.js';
import checkUserAuthentication from '../middlewares/auth-middleware.js';


//Route level middleware

router.use('/changePassword',checkUserAuthentication);

router.use('/userData', checkUserAuthentication);

//Public routes

router.post('/register', UserController.userRegistration);

router.post('/login', UserController.userLogin);

router.post('/send-password-reset-email', UserController.sendPasswordResetEmail);

router.post('/reset-password/:id/:token', UserController.userPasswordReset);

//Protected routes

router.post('/changePassword', UserController.changePassword);

router.get('/userData', UserController.loggedInUser);


export default router;