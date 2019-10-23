const express=require('express')
const router=express.Router()

router.use('/user',require('./user'))
router.use('/deck',require('./deck'))
router.use('/card',require('./card'))

module.exports=router