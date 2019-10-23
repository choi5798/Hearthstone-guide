const mysql=require('../../database/mysql')

//덱의 주인과 덱 이름을 가지고 DeckId값 반환
//return: deckId
exports.GetDeckId=(deckOwner,deckTitle)=>{
    return new Promise((resolve,reject)=>{
        mysql.getConnection((err,connection)=>{
            if (err) throw err
            connection.query(`select * from deck where deckOwner=\'${deckOwner}\' and deckTitle=\'${deckTitle}\'`,(err,results,field)=>{
                if (err) throw err
                connection.release()
                resolve(results[0].id)
            })
        })
    })
}