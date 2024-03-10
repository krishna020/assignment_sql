const nodeMailer=require('nodemailer')
const {SMPT_MAIL,SMPT_PASSWORD}=process.env;

const sendMail= async(email, mailSubject, content)=>
{
    try{
          const transport= nodeMailer.createTransport({
           // host:'smtp.gmail.com',
                service: 'gmail',
                port:465,
                secure: true, // true for 465, false for other ports
                logger: true,
                debug: true,
                secureConnection: false,
            auth:
            {
                user:SMPT_MAIL,
                pass:SMPT_PASSWORD
            },
            tls:{
                rejectUnAuthorized:true
            }
           });

           const mailOption={
            from:SMPT_MAIL,
            to:email,
            subject:mailSubject,
            html:content
           }
           transport.sendMail(mailOption, function(error,info)
           {
            if(error)
            {
                console.log(error)
            }
            else{
                console.log('Mail send successfully..!',info.response);
            }
           })
    }
    catch(err)
    {
  console.log(err.message)
    }
}

module.exports=sendMail