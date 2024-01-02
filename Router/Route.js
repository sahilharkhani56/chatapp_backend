import { Router } from "express"
import Auth from '../middleware/auth.js'
const router=Router()
// import {registerMail} from '../controlers/mailer.js'
// import all controler
import * as controller from '../controlers/appControlers.js'
//post method
router.route('/register').post(controller.register)
// router.route('/registerMail').post(registerMail)
router.route('/authenticate').post(controller.verifyUser,(req,res)=>res.end())
router.route('/login').post(controller.verifyUser,controller.login)
router.route('/addMessage').post(controller.addMessage)
router.route('/getMessage').post(controller.getMessage)


// Get method
router.route('/allUsers/:id').get(controller.getAllUsers)
router.route('/user/:username').get(controller.getUser)
// router.route('/generateOTP').get(controller.verifyUser,localVariables,controller.generateOTP)
// router.route('/verifyOTP').get(controller.verifyUser,controller.verifyOTP)
router.route('/createResetSession').get(controller.createResetSession)


// put method
router.route('/updateuser').put(Auth,controller.updateUser)
// router.route('/resetPassword').put(controller.verifyUser,controller.resetPassword)

export default router;