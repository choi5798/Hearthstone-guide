const express=require('express')
const router=express.Router()

const signUp=require('./signUp')
const login=require('./login')

router.post('/signup',signUp.SignUp)
router.post('/login',login.Login)

module.exports=router