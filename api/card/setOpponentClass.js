//result 출력 전, 선택한 상대 직업을 세션에 저장
//return: response status code
exports.SetOpponentClass=(req,res)=>{
    const opponentClass=req.body.opponentClass
    const DataCheck=()=>{
        return new Promise((resolve,reject)=>{
            if(!opponentClass){
                reject(({
                    query:'request_body_error'
                }))
            }
            else resolve()
        })
    }
    const Set=()=>{
        req.session.opponentClass=req.body.opponentClass
        return
    }
    DataCheck()
        .then(Set)
        .then(()=>{
            res.status(200).json({message:'complete setting opponent class'})
            })
        .catch((err)=>{
            res.status(500).json(err||err.message)
        })
}