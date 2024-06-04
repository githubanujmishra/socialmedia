const nodemailer = require('nodemailer') ; 
 
const sendmail = async (res ,  user , url ) => { 
    try{ 
        const url = `http://localhost:3000/forgetpassword/${user._id}` ; 

        const transport = nodemailer.createTransport({
            service : 'gmail' , 
            host : 'smtp.gmail.com' , 
            port : 465 , 
            auth: { 
                user : 'amankumartri@gmail.com' , 
                pass : 'wopmjukjqmfufirb' , 
            }, 
        });

        const mailOptions = { 
            from : 'social media private Ltd. <social@media.pvt.ltd>' , 
            to: user.email  , 
            subject : 'reset password link ' , 
            text : 'do not share this link to anyone ' , 
            html : `<a href='${url}'> Reset password link </a> ` , 
        } ; 

        transport.sendMail(mailOptions ,async  (err , info) => {
            if (err) return res.send(err) ; 
            console.log(info) ; 

            user.resetpasswordtoken = 1 ; 
            await user.save() ; 

            res.send(
                `<h1 class='text-5xl text-center mt-5 bg-red-300'>check your inbox/spam .</h1> `
            )
        });
        
        
    }catch (error ){ 
        res.send(error) ; 
    }
} ; 

module.exports = sendmail ; 