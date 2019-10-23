const mysql=require('../../database/mysql')

exports.DeleteDeck=(req,res)=>{
    console.log(req,res)
    let data = JSON.parse(req)
    return new Promise((resolve,reject)=> {
        mysql.getConnection((err, connection) => {
            if (err) throw err
            let deckId = data.deckId
            connection.query(`delete * from deck where id = \'${deckId}\';
            delete * from card where deckId = \'${deckId}\';`, (err, results, fields) => {
                if (err) throw err
                connection.release()
                resolve()
            })
        })
    })
}