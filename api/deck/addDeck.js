const mysql=require('../../database/mysql')
//덱 추가
//return: 없음
exports.AddDeck=(deckOwner,deckTitle,deckCode)=>{
    return new Promise((resolve,reject)=> {
        mysql.getConnection((err, connection) => {
            if (err) throw err
            connection.query(`insert into deck (deckOwner,deckTitle,deckCode) values (\'${deckOwner}\',\'${deckTitle}\',\'${deckCode}\');`, (err, results, fields) => {
                if (err) throw err
                connection.release()
                resolve()
            })
        })
    })
}