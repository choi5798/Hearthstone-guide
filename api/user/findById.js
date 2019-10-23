const mysql=require('../../database/mysql')
//사용자의 아이디를 가지고 유저 검색,
//return: 사용자가 있으면, 사용자 정보
//        사용자가 없으면, 없음
exports.findById=(userId)=>{
    return new Promise((resolve,reject)=>{
        mysql.getConnection((err,connection)=>{
            if(err){
                console.log('findById 에러 발생! : ' + err)
                return reject({
                    code: 'connect_db_error',
                    message: 'connect_db_error'
                })
            }
                
            connection.query(`select * from user where userId=\'${userId}\'`,(err,result,fields)=>{
                if(err){
                    connection.release()
                    return reject({
                        code:'select_db_error',
                        message:'select db error'
                    })
                }
                else{
                    connection.release()
                    resolve(result)
                }
            })
        })
    })

}


