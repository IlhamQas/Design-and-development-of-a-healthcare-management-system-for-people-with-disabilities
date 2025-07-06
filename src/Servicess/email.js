import nodemailer from 'nodemailer';
export async function sendEmail(dest,subject,message){
    let transporter = nodemailer.createTransport({
    service:'gmail',
    auth: {
        user:'haneensabra501@gmail.com', //process.env.UserEmail,
        pass:'lhve lcjp vgyi rmkk' //process.env.passwardApp
       
    }
    });

   
    let info = await transporter.sendMail({
        //from:`Maneger App <${process.env.UserEmail}>`, 
        from:`Sky medical<haneensabra501@gmail.com>`, 
        to: dest, 
        subject: subject, 
        html: message, 
    })
    console.log(info);

    return info
}//ciui mqgc othd mmhm