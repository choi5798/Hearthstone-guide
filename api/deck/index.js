const express=require('express')
const router=express.Router()

const newDeck=require('./newDeck')

router.post('/newdeck',newDeck.NewDeck)

module.exports=router