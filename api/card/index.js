const express=require('express')
const router=express.Router()

const setOpponentClass=require('./setOpponentClass')

router.post('/setopponentclass',setOpponentClass.SetOpponentClass)

module.exports=router