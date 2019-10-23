const mysql=require('../../database/mysql')
const fs=require('fs')
const request = require('request')

let cardEnUS=[]
let cardKoKR=[]


//카드 덱 ID와 카드 정보를 받아와, 카드별로 dbfId랑 매칭 시킨 후, card 테이블에 추가
//return: 없음
exports.AddCards=(deckId,cards)=>{

    return new Promise((resolve,reject)=>{
        // 전체 카드 읽어 오기
        request("https://api.hearthstonejson.com/v1/latest/enUS/cards.collectible.json", (err, res, data)=>{
            if (err) throw err
            cardEnUS=JSON.parse(data)
            //mysql 연결
            mysql.getConnection((err,connection)=>{
                if(err) throw err
                //카드별로 dbfId 찾기
                for (let i=0;i<cards.length;i++) {
                    let cardCost = 0
                    let cardName = cards[i].cardName
                    let cardNum = cards[i].cardNum
                    let cardId = 0
                    for (let i = 0; i < cardEnUS.length; i++) {
                        if (cardEnUS[i].name === cardName) {
                            cardCost = cardEnUS[i].cost
                            cardId = cardEnUS[i].dbfId
                            //single quote 처리
                            cardName=cardName.replace('\'','\'\'')
                            break
                        }
                    }
                    //카드  추가
                    connection.query(`insert into card (deckId,cardId,cardCost,cardName,cardNum) values (\'${deckId}\',\'${cardId}\',\'${cardCost}\',\'${cardName}\',\'${cardNum}\')`, (err, results, fields) => {
                        if (err) throw err
                    })
                }
                connection.release()
                resolve()
            })
        })
        // //전체 카드 읽어 오기
        // fs.readFile('cardsenUS.json',(err,data)=>{
        //     if (err) throw err
        //     cardEnUS=JSON.parse(data)
        //     //mysql 연결
        //     mysql.getConnection((err,connection)=>{
        //         if(err) throw err
        //         //카드별로 dbfId 찾기
        //         for (let i=0;i<cards.length;i++) {
        //             let cardCost = cards[i].cardCost
        //             let cardName = cards[i].cardName
        //             let cardNum = cards[i].cardNum
        //             let cardId = 0
        //             for (let i = 0; i < cardEnUS.length; i++) {
        //                 if (cardEnUS[i].name === cardName) {
        //                     cardId = cardEnUS[i].dbfId
        //                     //single quote 처리
        //                     cardName=cardName.replace('\'','\'\'')
        //                     break
        //                 }
        //             }
        //             //카드  추가
        //             connection.query(`insert into card (deckId,cardId,cardCost,cardName,cardNum) values (\'${deckId}\',\'${cardId}\',\'${cardCost}\',\'${cardName}\',\'${cardNum}\')`, (err, results, fields) => {
        //                 if (err) throw err
        //             })
        //         }
        //         connection.release()
        //         resolve()
        //     })
        // })
    })
}