import nodemailer from "nodemailer";
import ApiError from "./ApiError.js";

async function sendOTP(to, sub, text) {
  try {
    const auth = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const receiver = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: sub,
      text: text,
    };

    let result = await auth.sendMail(receiver, (error, emailResponce) => {
      if (error) {
        throw new ApiError(500, "Email is not send");
      }
      console.log("Email sended");
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export default sendOTP;
