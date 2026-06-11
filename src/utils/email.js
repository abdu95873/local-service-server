import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (to, otp) => {
  await transporter.sendMail({
    from: `"Local Service" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #333;">Password Reset</h2>
        <p>আপনার OTP কোড:</p>
        <div style="font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 8px; text-align: center; padding: 16px;">
          ${otp}
        </div>
        <p style="color: #888; font-size: 13px;">এই কোড ১০ মিনিটের জন্য valid।</p>
      </div>
    `,
  });
};

export const sendBookingConfirmationEmail = async (to, bookingDetails) => {
  await transporter.sendMail({
    from: `"Local Service" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Booking Confirmed!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px;">
        <h2 style="color: #16a34a;">Booking Confirmed ✅</h2>
        <p>আপনার booking সফলভাবে নেওয়া হয়েছে।</p>
        <table style="width:100%; border-collapse: collapse; margin-top: 16px;">
          <tr><td style="padding:8px; border:1px solid #eee;"><b>Service</b></td><td style="padding:8px; border:1px solid #eee;">${bookingDetails.service}</td></tr>
          <tr><td style="padding:8px; border:1px solid #eee;"><b>Date</b></td><td style="padding:8px; border:1px solid #eee;">${bookingDetails.date}</td></tr>
          <tr><td style="padding:8px; border:1px solid #eee;"><b>Address</b></td><td style="padding:8px; border:1px solid #eee;">${bookingDetails.address}</td></tr>
          <tr><td style="padding:8px; border:1px solid #eee;"><b>Price</b></td><td style="padding:8px; border:1px solid #eee;">৳${bookingDetails.price}</td></tr>
          <tr><td style="padding:8px; border:1px solid #eee;"><b>Payment</b></td><td style="padding:8px; border:1px solid #eee;">${bookingDetails.paymentMethod}</td></tr>
        </table>
      </div>
    `,
  });
};
