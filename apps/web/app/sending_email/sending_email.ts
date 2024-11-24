// email.ts
import nodemailer from 'nodemailer';

export const sendOTPEmail = async (email: string, otp: string) => {
  try{
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'example@gmail.com',
        pass: 'vcezdfjjkdfakdfj'
      }
    });
  
    const mailOptions = {
      from: 'example@gmail.com',
      to: email,
      subject: 'Your OTP for Password Reset',
      text: `Your OTP is: ${otp}`
    };
  
    await transporter.sendMail(mailOptions);
    return true
  }catch(error){
    console.log(error)
    return false
  }
};


