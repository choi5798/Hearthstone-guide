const express=require('express')
const bodyParser=require('body-parser')
const fs=require('fs')
const session=require('express-session')
const path=require('path')
const morgan=require('morgan')
const mysqlApostrophe=require('mysql-apostrophe')
const ejs=require('ejs')
const mysql=require('./database/mysql')
const request = require('request')
require('dotenv').config()
const app=express()

app.use(morgan('[:date[iso]] :method :status :url :response-time(ms) :user-agent'))

app.use('/static',express.static(path.join(__dirname, '/static')))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH')
    res.header('Access-Control-Allow-Headers', 'content-type, x-access-token')
    next()
})
app.use(session({
    secret:'ambc@!vsmkv#!&*!#EDNAnsv#!$()_*#@',
    resave:false,
    saveUninitialized:true
}))

app.use(mysqlApostrophe)

app.use('/api',require('./api'))

let allCards=[]

request("https://api.hearthstonejson.com/v1/latest/koKR/cards.collectible.json", (err, res, body)=>{
    allCards = JSON.parse(body)
    // console.log(allCards)
})

app.use(session({
    secret:'ambc@!vsmkv#!&*!#EDNAnsv#!$()_*#@',
    resave:false,
    saveUninitialized:true
}))

app.get('/',(req,res)=>{
    res.redirect('/decklist')
})


app.get('/signup',(req,res)=>{
    fs.readFile('./views/html/signup.html',(err,data)=>{
        res.writeHead(200,{'Content-Type':'text/html'})
        console.log(data)
        res.end(data)
    })
})

app.get('/login',(req,res)=>{
    fs.readFile('./views/html/login.html',(err,data)=>{
        res.writeHead(200,{'Content-Type':'text/html'})
        res.end(data)
    })
})

app.post('/logout',(req,res)=>{
    delete req.session.deckId
    delete req.session.sid
    res.status(200).json({result:'Logout Successful'})
})

app.get('/decklist',(req,res)=>{
    if(!req.session.sid)
        res.redirect('/login')
    else{
        mysql.getConnection((err,connection)=>{
            if (err) throw err
            connection.query(`select id,deckTitle from deck where deckOwner=\'${req.session.sid}\'`,(err,results,fields)=>{
                if (err) throw err
                else{
                    fs.readFile('./views/ejs/decklist.ejs','utf-8',(err,data)=>{
                        res.writeHead(200,{'Content-Type':'text/html'})
                        res.end(ejs.render(data,{
                            decks:results,
                        }))
                    })
                }
            })
            connection.release()
        })
    }

})

app.get('/ingame/:deckId',(req,res)=>{
    if(!req.session.sid)
        res.redirect('/login')
    else{
        req.session.deckId=req.params.deckId
        fs.readFile('./views/html/ingame.html',(err,data)=>{
            res.writeHead(200,{'Content-Type':'text/html'})
            res.end(data)
        })
    }

})

app.get('/newdeck',(req,res)=>{
    if(!req.session.sid)
        res.redirect('/login')
    else{
        fs.readFile('./views/html/newdeck.html',(err,data)=>{
            res.writeHead(200,{'Content-Type':'text/html'})
            res.end(data)
        })
    }
})

const getResult=require('./api/card/getResult')

app.get('/result',(req,res)=>{
    if(!req.session.sid)
        res.redirect('/login')
    else{
        (async ()=>{
            await getResult.GetResult(req,res)
        })()
    }
})

app.listen(process.env.SERVER_PORT || 3000,()=>{
    console.log('sample server is listening to port ' + process.env.SERVER_PORT)
})