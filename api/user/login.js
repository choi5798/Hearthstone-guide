const findById=require('./findById')
const bcrypt=require('bcrypt-nodejs')

//입력한 아이디와 비밀번호를 가지고 로그인
exports.Login=(req,res)=>{
    const userId=req.body.userId
    const password=req.body.password
    //아이디와 비밀번호가 존재 하는지 체크
    const DataCheck=()=>{
        return new Promise((resolve,reject)=>{
            if(!userId || !password){
                return reject({
                    code: 'request_body_error',
                    message: 'request body is not defined'
                })
            }
            else resolve()
        })
    }
    //이 아이디로 등록된 사용자가 있는 지 체크
    const IdCheck=()=>{
        let user={}
        const findUser= async ()=>{
            try{
                user =await findById.findById(userId)
                return user
            }
            catch (err) {
                return Promise.reject(err)
            }
        }
        return findUser()
    }
    //해당 유저의 비밀번호와 입력된 비밀번호가 같은 지 체크
    const PwCheck=(user)=>{
        if (user[0]==null){
            return Promise.reject({
                code:'id_wrong',
                message:'id wrong'
            })
        }
        //암호화 모듈을 사용했기 때문에, 서로 비교하는 함수를 써야함
        if(bcrypt.compareSync(password,user[0].password)){
            req.session.sid=userId
            req.session.save(()=>{
                res.status(200).json({userId:userId})
            })
        }
        else{
            return Promise.reject({
                code:'pw_wrong',
                message:'pw wrong'
            })
        }
    }

    DataCheck()
        .then(IdCheck)
        .then(PwCheck)
        .catch((err)=>{
            console.log(err)
            res.status(500).json(err.message|err)
        })
}