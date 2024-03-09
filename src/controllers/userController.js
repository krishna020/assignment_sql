
const {validationResult}=require('express-validator')
const bcrypt=require('bcryptjs')


const db=require('../config/conn')
const randomString=require('randomstring')
const  sendMail=require('../helpers/sendMail')

const register=(req,res)=>
{
     const errors=validationResult(req)  
     if(!errors.isEmpty())
     {
        return res.status(400).json({errors:errors.array()})
     }
     db.query(
        `SELECT * FROM users WHERE LOWER(email)=LOWER(${db.escape(req.body.email)})`,
        (err,result)=>
        {
           if(result && result.length)
           {
            return res.status(409).send({
                msg:'this user is already registered.'
            })
           } 
           else{
              bcrypt.hash(req.body.password,10,(err,hash)=>
              {
                if(err)
                {
                    return res.status(400).send({
                        msg:err
                    })   
                }
                else{
                    db.query(`
                    INSERT INTO users(name,email,password)
                    VALUES('${req.body.name}',${db.escape(
                       req.body.email
                    )},${db.escape(hash)});`,
                    (err,result)=>
                    {
                        if(err)
                        {
                            return res.status(400).send({
                                msg:err
                            }); 
                        }
                            let mailSubject='mail verification';
                            const randomToken=randomString.generate();
                            let content=`<p> Hii ${req.body.name}, Please <a href="http://127.0.0.1:3000/api/v1/users/mail-verification?token=${randomToken}">verify</a>`;
                            sendMail(req.body.email, mailSubject,content);
                            db.query('UPDATE users set token=? where email=?',[randomToken,req.body.email],function(err,result)
                            {
                                if(err)
                                {
                                    return res.status(400).send({
                                        msg:err
                                    }); 
                                }
                            });

                        return res.status(500).send({
                            msg:'User has been register'
                        })
                    }
                    );
                }
              })
           }
        }
     );
}

module.exports=register