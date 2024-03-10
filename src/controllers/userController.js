
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')



const db = require('../config/conn')
const randomString = require('randomstring')
const sendMail = require('../helpers/sendMail')
const jwt = require('jsonwebtoken')
//require('../routes/webRoute')
const { JWT_SECRET } = process.env;

const register = (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    db.query(
        `SELECT * FROM users WHERE LOWER(email)=LOWER(${db.escape(req.body.email)})`,
        (err, result) => {
            if (result && result.length) {
                return res.status(409).send({
                    msg: 'this user is already registered.'
                })
            }
            else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(400).send({
                            msg: err
                        })
                    }
                    else {
                        db.query(`
                    INSERT INTO users(name,email,password,profilePic)
                    VALUES('${req.body.name}',${db.escape(
                            req.body.email
                        )},${db.escape(hash)},'images/${req.file.filename}');`,
                            (err, result) => {
                                if (err) {
                                    return res.status(400).send({
                                        msg: err
                                    });
                                }
                                let mailSubject = 'mail verification';
                                const randomToken = randomString.generate();
                                let content = `<p> Hii ${req.body.name}, Please <a href="http://127.0.0.1:3000/api/v1/users/mail-verification?token=${randomToken}">verify</a>`;
                                sendMail(req.body.email, mailSubject, content);
                                db.query('UPDATE users set token=? where email=?', [randomToken, req.body.email], function (err, result) {
                                    if (err) {
                                        return res.status(400).send({
                                            msg: err
                                        });
                                    }
                                });

                                return res.status(500).send({
                                    msg: 'User has been register'
                                })
                            }
                        );
                    }
                })
            }
        }
    );
}

const verifyMail = (req, res) => {
    var token = req.query.token;
    db.query('SELECT * FROM users token=? limit 1', token, function (error, result, fields) {
        if (error) {
            console.log(error.message);
        }
        if (result.length > 0) {
            db.query(`
      UPDATE users SET token = null, is_verified =1 WHERE id='${result[0].id}'
      `)
            return res.render('mail-verification', { message: 'mail verified successfully' })
        }
        else {
            return res.render('404')
        }
    })
}

const login = (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    db.query(
        `SELECT * FROM users WHERE email=${db.escape(req.body.email)};`,
        (err, result) => {
            if (err) {
                return res.status(400).send({
                    msg: err
                });
            }
            //console.log('result: '+result)
            if (!result.length) {
                return res.status(401).send({
                    msg: 'email or password incorrect..!'
                });
            }
            bcrypt.compare(
                req.body.password,
                result[0]['password'],
                (bErr, bResult) => {
                    if (bErr) {
                        return res.status(400).send({
                            msg: bErr
                        });
                    }
                    if (bResult) {
                        const token = jwt.sign({ id: result[0]['id'], is_admin: result[0]['is_admin'] }, JWT_SECRET, { expiresIn: '24h' });
                        db.query(
                            `UPDATE users SET last_login=now() WHERE id='${result[0]['id']}'`

                        );
                        return res.status(200).send({
                            msg: 'login',
                            token: token,
                            user: result[0]
                        });
                    }
                    return res.status(401).send({
                        msg: 'email or password incorrect..!'
                    });
                }
            );
        }
    )
}

const getUser = (req, res) => {

    const authToken = req.headers.authorization.split(' ')[1];

    const decode = jwt.verify(authToken, JWT_SECRET);
    db.query(
        `SELECT * FROM users where id=?`, decode.id, function (error, result, fields) {
        if (error) throw error;
        return res.status(200).send({ success: true, data: result[0], message: 'Fetch data successfully' })
    }
    )
}

const forgetPassword = (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    var email = req.body.email
    db.query(
        `SELECT * FROM users WHERE email=? limit 1`, email, function (error, result, fields) {
        if (error) {
            return res.status(400).json({ message: error })
        }
        if (result.length > 0) {
            let mailSubject = 'forget password';
            const randomstring = randomString.generate();
            const content = '<p> Hii, ' + result[0].name + '\
                please  <a href="http://127.0.0.1:3000/api/v1/users/reset-password?token='+ randomstring + '"> Please click for reset your password</a></p>\
                ';
            sendMail(email, mailSubject, content)
            db.query(
                `INSERT INTO password_resets (email,token) VALUES(${db.escape(result[0].email)},'${randomString}')`
            );
        }
        return res.status(200).send({
            message: "Mail send successfully for forget password"
        })

    }
    )
}

const resetPasswordLoad = async (req, res) => {
    try {

        var token = req.query.token;
        if (token == undefined) {
            res.render('404')
        }
        db.query(
            `SELECT * FROM  password_resets WHERE token=? limit 1`, token, function (error, result, fields) {
            if (error) {
                console.log(error.message)
            }

            if (result !==undefined && result.length > 0) {
                db.query(
                    'SELECT * FROM users WHERE email=? LIMIT 1', result[0].email, function (error, result, fields) {
                    if (error) {
                        console.log(error.message)
                    }
                    res.render('reset-password',{user:result[0]})
                }
                )
            }
            else {
                res.render('404')
            }
        }
        );

    }
    catch (error) {
        console.log(error)
    }
}

const resetPassword=(req,res)=>
{
     if(req.body.password !=req.body.confirm_password)
     {
        res.render('reset-password',{error_message:'Password not matched..!',user:{id:req.body.user_id,email:req.body.email}})
     }
     bcrypt.hash(req.body.confirm_password,10,(err,hash)=>
     {
        if(err)
        {
           console.log(err) 
        }
        db.query(`DELETE FROM password resets WHERE email='${req.body.email}'`);
        db.query(`UPDATE users SET password='${hash}' WHERE id='${req.body.user_id}'`);
         res.render('message',{message:'password reset successfully'})
     })
}

const updateProfile=async (req,res)=>
{
    try{
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        const token=req.headers.authorization.split(' ')[1];
       const decode= jwt.verify(token, JWT_SECRET)
        var sql=''
        var data;
        if(req.file!=undefined)
        {
             sql='UPDATE users  SET name=? , profilePic = ? WHERE  id = ?' 
             data=[req.body.name, req.body.email,'profilePic/'+req.file.filename,decode.id];
        }
        else{
            sql='UPDATE users  SET name=? , profilePic = ? WHERE  id = ?' 
            data=[req.body.name, req.body.email,decode.id];
        }
        db.query(sql,data, function(error,result,fields)
        {
            if(error)
            {
                res.status(400).send({
                    msg:error
                });
            }

            res.status(200).send({
                msg:'profile update successfully'
            });
        })
    }
    catch(error)
    {
      return res.status(400).json({
        msg:error.message
      })
    }
   

}

module.exports = {
    register,
    verifyMail,
    login,
    getUser,
    forgetPassword,
    resetPasswordLoad,
    resetPassword,
    updateProfile
}
