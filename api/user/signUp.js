const findById=require('./findById')
const mysql=require('../../database/mysql')
const bcrypt=require('bcrypt-nodejs')
//입력된 아이디와 비밀번호를 가지고 회원가입.
//비밀번호 확인은 프론트 단에서 이루어 졌음.
//return: response status code
exports.SignUp=(req,res)=>{
    const userId=req.body.userId
    const password=req.body.password
    console.log('userId : ' + userId)
    console.log('password : ' + password)
    //아이디와 비밀번호가 존재하는 지 체크
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
    //해당 아이디로 등록한 회원이 있는 지 체크
    const UserCheck=()=>{
        let user={}
        const findUser=async ()=>{
            try{
                user= await findById.findById(userId)
                return user
            }
            catch(err){
                console.log('UserCheck 에러뜸!!')
                return Promise.reject(err)
            }
        }
        return findUser()
    }
    //아이디가 중복되지 않았다면 회원가입 진행
    const SignUp=(user)=>{
        if(user[0]!=null){
            return Promise.reject({
                code:'User_Already_Exists',
                message:'User Already Exists'
            })
        }
        //비밀번호는 암호화 하여 데이터베이스에 저장
        const hash=bcrypt.hashSync(password,bcrypt.genSaltSync(10),null)
        mysql.getConnection((err,connection)=>{
            // console.log('connect 전')
            if(err) throw err
            // console.log('connect 후 : connect 성공!!')
            connection.query(`insert into user (userId,password) values (\'${userId}\',\'${hash}\');`,(err,results,fields)=>{
                if(err) throw err
                connection.release()
            })
        })

    }

    DataCheck()
        .then(UserCheck)
        .then(SignUp)
        .then(()=>{
            return res.status(200).json({userId:userId})
        })
        .catch((err)=>{
            console.log(err)
            res.status(500).json(err.message||err)
        })
}