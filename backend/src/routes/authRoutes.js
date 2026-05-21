import express from 'express';
import login from '../controllers/authControllers.js'
const router=express.Router();

/**
 * login route
 *
 * handles user login request
 *
 * @constant router express router
 * @requires login controller
 *
 * @route POST /login
 */
router.post("/login",login);

export default router;