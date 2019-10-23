const mysql=require('../../database/mysql')

//덱 ID를 바탕으로 해당 덱에 속해있는 모든 카드 Id 반환
//return: json array
exports.GetCardId=(deckId)=>{
    return new Promise((resolve,reject)=>{
        mysql.getConnection((err,connection)=>{
            if (err) throw err
            connection.query(`select cardId from card where deckId=\'${deckId}\'`,(err,results,fields)=>{
                if (err) throw err
                resolve(results)
            })
            connection.release()
        })
    })
}