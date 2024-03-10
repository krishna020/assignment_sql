
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')

const db = require('../config/conn')
const randomString = require('randomstring')
const sendMail = require('../helpers/sendMail')
const jwt = require('jsonwebtoken')
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
                    msg: 'This user is already registered.'
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
                            INSERT INTO users(name, email, password, profilePic)
                            VALUES('${req.body.name}',${db.escape(req.body.email)}, ${db.escape(hash)}, 'images/${req.file.filename}');`,
                            (err, result) => {
                                if (err) {
                                    return res.status(400).send({
                                        msg: err
                                    });
                                }

                                db.query(
                                    `SELECT * FROM users WHERE id = ${result.insertId}`,
                                    (err, user) => {
                                        if (err) {
                                            return res.status(500).send({
                                                msg: 'Error fetching user data'
                                            });
                                        }
                                        return res.status(200).send({
                                            msg: 'User has been registered',
                                            user: user[0] // Return the created user
                                        });
                                    }
                                );
                            }
                        );
                    }
                })
            }
        }
    );
}

 // login api
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
                        const token = jwt.sign({ id: result[0]['id'], userType: result[0]['userType'] }, JWT_SECRET, { expiresIn: '24h' });
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








const updateProfile = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, JWT_SECRET)
        var sql = ''
        var data;
        if (req.file != undefined) {
            sql = 'UPDATE users  SET name=? , profilePic = ? WHERE  id = ?'
            data = [req.body.name, req.body.email, 'profilePic/' + req.file.filename, decode.id];
        }
        else {
            sql = 'UPDATE users  SET name=? , profilePic = ? WHERE  id = ?'
            data = [req.body.name, req.body.email, decode.id];
        }
        db.query(sql, data, function (error, result, fields) {
            if (error) {
                res.status(400).send({
                    msg: error
                });
            }

            res.status(200).send({
                msg: 'profile update successfully'
            });
        })
    }
    catch (error) {
        return res.status(400).json({
            msg: error.message
        })
    }


}

// forget passord

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



const activateUser = (req, res) => {
    const { id } = req.params;
    if (!req.user || req.user.userType !== 'admin') {
        return res.status(403).send({
            msg: 'Access denied. Admin privileges required'
        });
    }
    // Activate the user account
    db.query(
        `UPDATE users SET isActive = 1 WHERE id = ${db.escape(id)}`,
        (err, result) => {
            if (err) {
                return res.status(500).send({
                    msg: 'Error activating user account'
                });
            }
            return res.status(200).send({
                msg: 'User account activated successfully'
            });
        }
    );
};


const deactivateUser = (req, res) => {
    const { id } = req.params;
    if (!req.user || req.user.userType !== 'admin') {
        return res.status(403).send({
            msg: 'Access denied. Admin privileges required'
        });
    }
    // Deactivate the user account
    db.query(
        `UPDATE users SET isActive = 0 WHERE id = ${db.escape(id)}`,
        (err, result) => {
            if (err) {
                return res.status(500).send({
                    msg: 'Error deactivating user account'
                });
            }
            return res.status(200).send({
                msg: 'User account deactivated successfully'
            });
        }
    );
};



module.exports = {
    register,
    login,
    updateProfile,
    activateUser,
    deactivateUser,
    forgetPassword
}
