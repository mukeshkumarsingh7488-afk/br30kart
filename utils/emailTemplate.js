const nodemailer = require("nodemailer");
/* ---------------- SEND EMAIL CORE (GMAIL SMTP) ---------------- */
const sendEmail = async (options) => {
  try {
    // 1. Transporter banayein (Gmail settings)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Aapka Gmail ID
        pass: process.env.EMAIL_PASS, // Aapka "App Password" (Normal password nahi)
      },
    });

    console.log(`📧 Sending email TO: ${options.to || options.email}`);

    // 2. Mail options set karein
    const mailOptions = {
      from: `"BR30 Trader" <${process.env.EMAIL_USER}>`,
      to: options.to || options.email,
      subject: options.subject,
      html: options.html || options.message,
    };

    // 3. Email send karein
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email Sent Successfully via Nodemailer:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Nodemailer Error:", error.message);
    throw error;
  }
};

// Upgraded Registration OTP Template v2.5
const registerOtpTemplate = (otp, name = "User") => {
  const syncId = Math.random().toString(36).substring(2, 12).toUpperCase();
  const timestamp = new Date().toLocaleString("en-IN");

  return `
  <!DOCTYPE html><html><head><meta charset="UTF-8"><style>
  .email-body { background-color: #000000 !important; padding: 40px 20px; font-family: 'Segoe UI', Arial, sans-serif; margin: 0; }
  .card { max-width: 600px; margin: auto; background: #050505; border-radius: 30px; border: 1px solid rgba(0, 255, 136, 0.4); overflow: hidden; box-shadow: 0 0 50px rgba(0, 255, 136, 0.15); }
  .banner { width: 100%; display: block; border-bottom: 3px solid #00ff88; }
  .content { padding: 45px 35px; text-align: left; color: #ffffff !important; }
  .alert-title { color: #00ff88 !important; font-size: 22px; font-weight: 900; text-shadow: 0 0 15px rgba(0, 255, 136, 0.3); letter-spacing: 2px; text-transform: uppercase; margin: 0; }
  .thanks-note { color: #00ff88 !important; font-size: 18px; font-weight: 700; margin-bottom: 10px; display: block; }
  
  .otp-box { 
    text-align: center; 
    margin: 35px 0; 
    background: linear-gradient(145deg, rgba(0, 255, 136, 0.08), rgba(0, 0, 0, 1)); 
    padding: 30px; 
    border-radius: 20px; 
    border: 1px dashed rgba(0, 255, 136, 0.4);
  }
  .otp-code { 
    display: inline-block; 
    color: #00ff88; 
    font-size: 38px; 
    letter-spacing: 10px; 
    font-weight: 900; 
    text-shadow: 0 0 12px rgba(0, 255, 136, 0.5);
  }

  .footer { background: #010101; padding: 35px; text-align: center; border-top: 1px solid #1a1a1a; }
  .admin-tag { color: #00ff88 !important; font-weight: 800; font-size: 16px; letter-spacing: 1px; }
  </style></head>

  <body class="email-body">
  <div class="card">

  <img src="https://i.ibb.co/wZS4wvv1/Green-burner-jpg.jpg" alt="BR30 Welcome" class="banner">

  <div class="content">
    <span class="thanks-note">Welcome to BR30ᴛʀᴀᴅᴇʀ! 🚀</span>
    <h1 class="alert-title">VERIFY YOUR ACCOUNT</h1>

    <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin-top: 15px;">
      Hi <b>${name}</b>, your journey to professional trading starts here. To secure your profile and access our elite tools, please use the verification code below:
    </p>

    <div class="otp-box">
      <span class="otp-code">${otp}</span>
      <p style="color: #cbd5e1; font-size: 12px; margin-top: 15px; letter-spacing: 1px; font-weight: bold;">
        EXPIRES IN: 10 MINUTES
      </p>
    </div>

    <p style="color: #64748b; font-size: 12px; text-align: center; font-style: italic; border-top: 1px solid #1a1a1a; padding-top: 15px;">
      ⚠️ <b>Security Note:</b> Never share this code with anyone. BR30 staff will never ask for your OTP. ✅
    </p>

    <!-- Invisible trace string to keep Gmail footer visible -->
    <div style="display:none; white-space:nowrap; font-size:0px; line-height:0px;">
      Register-Trace-ID: ${syncId} | Stamp: ${timestamp}
    </div>
  </div>

  <div class="footer">
    <div style="color: #64748b; font-size: 13px; line-height: 1.6;">
      Regards,<br>
      <span class="admin-tag">BR30 Onboarding Team</span><br>
      Official Support & Security Division
    </div>

    <p style="color: #b1a5a5; font-size: 10px; margin-top: 20px; font-style: italic;">
      🚫 <b>Note:</b> This is an auto-generated verification alert.
    </p>

    <!-- SOCIAL LINKS -->
    <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #1a1a1a;">
      <p style="color: #00ff88; font-size: 11px; letter-spacing: 2px; margin-bottom: 15px;">
        JOIN OUR COMMU&#8203;NITY 🚀
      </p>

      <a href="https://www.youtube.com" style="margin: 0 10px; text-decoration:none;">
        <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="22">
      </a>
      <a href="https://www.instagram.com/br30traderofficial" style="margin: 0 10px; text-decoration:none;">
        <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="22">
      </a>
      <a href="https://www.facebook.com/share/1DDJYGYYDf/" target="_blank" style="text-decoration:none;">
        <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="17" style="background:#1877F2; border-radius:50%; padding:3px; margin:0 5px;">
      </a>
      <a href="https://t.me/+F8mDhdfiGaI1NDY1" style="margin: 0 10px; text-decoration:none;">
        <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="22">
      </a>
      <a href="https://chat.whatsapp.com/B4t82SWBcgOIZTeQXp1wDI" style="margin: 0 10px; text-decoration:none;">
        <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="22">
      </a>
    </div>

    <div style="margin-top:20px; color:#64748b; font-size:10px;">
      BR30 TRADER GLOBAL v2.5<br>
      Security Hash: ${syncId}
    </div>
  </div>
  </div>
  </body></html>
  `;
};

// Upgraded Password Reset OTP Template v2.5
const forgotPasswordTemplate = (otp, name = "User") => {
  const syncId = Math.random().toString(36).substring(2, 12).toUpperCase();
  const timestamp = new Date().toLocaleString("en-IN");

  return `
  <!DOCTYPE html><html><head><meta charset="UTF-8"><style>
  .email-body { background-color: #000000 !important; padding: 40px 20px; font-family: 'Segoe UI', Arial, sans-serif; margin: 0; }
  .card { max-width: 600px; margin: auto; background: #050505; border-radius: 30px; border: 1px solid rgba(0, 255, 136, 0.4); overflow: hidden; box-shadow: 0 0 50px rgba(0, 255, 136, 0.15); }
  .banner { width: 100%; display: block; border-bottom: 3px solid #00ff88; }
  .content { padding: 45px 35px; text-align: left; color: #ffffff !important; }
  .alert-title { color: #00ff88 !important; font-size: 22px; font-weight: 900; text-shadow: 0 0 15px rgba(0, 255, 136, 0.3); letter-spacing: 2px; text-transform: uppercase; margin: 0; }
  .thanks-note { color: #00ff88 !important; font-size: 18px; font-weight: 700; margin-bottom: 10px; display: block; }
  
  .otp-box { 
    text-align: center; 
    margin: 35px 0; 
    background: linear-gradient(145deg, rgba(0, 255, 136, 0.08), rgba(0, 0, 0, 1)); 
    padding: 30px; 
    border-radius: 20px; 
    border: 1px dashed rgba(0, 255, 136, 0.4);
  }
  .otp-code { 
    display: inline-block; 
    color: #00ff88; 
    font-size: 38px; 
    letter-spacing: 10px; 
    font-weight: 900; 
    text-shadow: 0 0 12px rgba(0, 255, 136, 0.5);
  }

  .footer { background: #010101; padding: 35px; text-align: center; border-top: 1px solid #1a1a1a; }
  .admin-tag { color: #00ff88 !important; font-weight: 800; font-size: 16px; letter-spacing: 1px; }
  </style></head>

  <body class="email-body">
  <div class="card">

  <img src="https://i.ibb.co/wZS4wvv1/Green-burner-jpg.jpg" alt="Account Security" class="banner">

  <div class="content">
    <span class="thanks-note">Hi ${name}, Security Verification! 🔐</span>
    <h1 class="alert-title">PASSWORD RESET OTP</h1>

    <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin-top: 15px;">
      We received a request to reset your password. Use the verification code below to proceed. For your security, this code should not be shared.
    </p>

    <div class="otp-box">
      <span class="otp-code">${otp}</span>
      <p style="color: #cbd5e1; font-size: 12px; margin-top: 15px; letter-spacing: 1px; font-weight: bold;">
        VALID FOR: 10 MINUTES
      </p>
    </div>

    <p style="color: #64748b; font-size: 12px; text-align: center; font-style: italic; border-top: 1px solid #1a1a1a; padding-top: 15px;">
      If you didn't request this, please ignore this email or contact support. ✅
    </p>

    <!-- Invisible trace string to keep Gmail footer visible -->
    <div style="display:none; white-space:nowrap; font-size:0px; line-height:0px;">
      Auth-Trace-ID: ${syncId} | Sync-Time: ${timestamp}
    </div>
  </div>

  <div class="footer">
    <div style="color: #64748b; font-size: 13px; line-height: 1.6;">
      Regards,<br>
      <span class="admin-tag">BR30 Security Team</span><br>
      Official Support & Security Division
    </div>

    <p style="color: #b1a5a5; font-size: 10px; margin-top: 20px; font-style: italic;">
      🚫 <b>Note:</b> Automated security alert. System logged at ${timestamp}
    </p>

    <!-- SOCIAL LINKS -->
    <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #1a1a1a;">
      <p style="color: #00ff88; font-size: 11px; letter-spacing: 2px; margin-bottom: 15px;">
        STAY CON&#8203;NECTED WITH US 🚀
      </p>

      <a href="https://www.youtube.com" style="margin: 0 10px; text-decoration:none;">
        <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="22">
      </a>
      <a href="https://instagram.com" style="margin: 0 10px; text-decoration:none;">
        <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="22">
      </a>
      <a href="https://www.facebook.com/share/1DDJYGYYDf/" target="_blank" style="text-decoration:none;">
        <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="17" style="background:#1877F2; border-radius:50%; padding:3px; margin:0 5px;">
      </a>
      <a href="https://t.me" style="margin: 0 10px; text-decoration:none;">
        <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="22">
      </a>
      <a href="https://whatsapp.com" style="margin: 0 10px; text-decoration:none;">
        <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="22">
      </a>
    </div>

    <div style="margin-top:20px; color:#64748b; font-size:10px;">
      BR30 TRADER AUTOMATED SECURITY v2.5<br>
      Security Hash: ${syncId}
    </div>
  </div>
  </div>
  </body></html>
  `;
};

// Upgraded Seller Forgot Password OTP Template v2.5
const sellerForgotPasswordTemplate = (otp, name = "Seller") => {
  const traceId = Math.random().toString(36).substring(2, 12).toUpperCase();
  const timestamp = new Date().toLocaleString("en-IN");

  return `
  <!DOCTYPE html><html><head><meta charset="UTF-8"><style>
  .email-body { background-color: #000000 !important; padding: 40px 20px; font-family: 'Segoe UI', Arial, sans-serif; margin: 0; }
  .card { max-width: 600px; margin: auto; background: #050505; border-radius: 30px; border: 1px solid rgba(0, 255, 136, 0.4); overflow: hidden; box-shadow: 0 0 50px rgba(0, 255, 136, 0.15); }
  .banner { width: 100%; display: block; border-bottom: 3px solid #00ff88; }
  .content { padding: 45px 35px; text-align: left; color: #ffffff !important; }
  .alert-title { color: #00ff88 !important; font-size: 22px; font-weight: 900; text-shadow: 0 0 15px rgba(0, 255, 136, 0.3); letter-spacing: 2px; text-transform: uppercase; margin: 0; }
  .thanks-note { color: #00ff88 !important; font-size: 18px; font-weight: 700; margin-bottom: 10px; display: block; }
  
  .otp-box { 
    text-align: center; 
    margin: 35px 0; 
    background: linear-gradient(145deg, rgba(0, 255, 136, 0.08), rgba(0, 0, 0, 1)); 
    padding: 30px; 
    border-radius: 20px; 
    border: 1px dashed rgba(0, 255, 136, 0.4);
  }
  .otp-code { 
    display: inline-block; 
    color: #00ff88; 
    font-size: 38px; 
    letter-spacing: 10px; 
    font-weight: 900; 
    text-shadow: 0 0 12px rgba(0, 255, 136, 0.5);
  }

  .footer { background: #010101; padding: 35px; text-align: center; border-top: 1px solid #1a1a1a; }
  .admin-tag { color: #00ff88 !important; font-weight: 800; font-size: 16px; letter-spacing: 1px; }
  </style></head>

  <body class="email-body">
  <div class="card">

  <img src="https://i.ibb.co/wZS4wvv1/Green-burner-jpg.jpg" alt="Security Lockdown" class="banner">

  <div class="content">
    <span class="thanks-note">Hi ${name}, Security Alert! 🔐</span>
    <h1 class="alert-title">PASSWORD RESET REQUEST</h1>

    <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin-top: 15px;">
      We received a request to access and reset the credentials for your <b>Seller Account</b>. If this was you, please use the secure code below:
    </p>

    <div class="otp-box">
      <span class="otp-code">${otp}</span>
      <p style="color: #cbd5e1; font-size: 12px; margin-top: 15px; letter-spacing: 1px; font-weight: bold;">
        EXPIRES IN: 10 MINUTES
      </p>
    </div>

    <p style="color: #64748b; font-size: 12px; text-align: center; font-style: italic; border-top: 1px solid #1a1a1a; padding-top: 15px;">
      ⚠️ <b>Security Warning:</b> Never share this OTP with anyone, including BR30 staff.
    </p>

    <!-- Invisible trace string for Gmail bypass -->
    <div style="display:none; white-space:nowrap; font-size:0px; line-height:0px;">
      Security-Trace: ${traceId} | Sync-Stamp: ${timestamp}
    </div>
  </div>

  <div class="footer">
    <div style="color: #64748b; font-size: 13px; line-height: 1.6;">
      Regards,<br>
      <span class="admin-tag">BR30 Security Team</span><br>
      Official Support & Security Division
    </div>

    <p style="color: #b1a5a5; font-size: 10px; margin-top: 20px; font-style: italic;">
      🚫 <b>Note:</b> If you did not request this, please ignore this email or contact support.
    </p>

    <!-- SOCIAL LINKS -->
    <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #1a1a1a;">
      <p style="color: #00ff88; font-size: 11px; letter-spacing: 2px; margin-bottom: 15px;">
        STAY CON&#8203;NECTED WITH US 🚀
      </p>


  <a href="https://www.youtube.com" style="margin: 0 10px; text-decoration:none;">
    <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="22">
  </a>

  <a href="https://www.instagram.com/br30traderofficial" style="margin: 0 10px; text-decoration:none;">
    <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="22">
  </a>

  <a href="https://www.facebook.com/share/1DDJYGYYDf/" target="_blank" style="text-decoration:none;">
       <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
       width="17"
       style="background:#1877F2; border-radius:50%; padding:3px; margin:0 5px;">
  </a>

  <a href="https://t.me/+F8mDhdfiGaI1NDY1" style="margin: 0 10px; text-decoration:none;">
    <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="22">
  </a>

  <a href="https://chat.whatsapp.com/B4t82SWBcgOIZTeQXp1wDI" style="margin: 0 10px; text-decoration:none;">
    <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="22">
  </a>
    </div>

    <div style="margin-top:20px; color:#64748b; font-size:10px;">
      BR30 TRADER AUTOMATED SECURITY v2.5<br>
      Session Hash: ${traceId}
    </div>
  </div>
  </div>
  </body></html>
  `;
};

// Upgraded Seller OTP Verification Template v2.5
const sellerOtpTemplate = (otp, name = "User") => {
  const requestId = Math.random().toString(36).substring(2, 10).toUpperCase();
  const timestamp = new Date().toLocaleString("en-IN");

  return `
  <!DOCTYPE html><html><head><meta charset="UTF-8"><style>
  .email-body { background-color: #000000 !important; padding: 40px 20px; font-family: 'Segoe UI', Arial, sans-serif; margin: 0; }
  .card { max-width: 600px; margin: auto; background: #050505; border-radius: 30px; border: 1px solid rgba(0, 255, 136, 0.4); overflow: hidden; box-shadow: 0 0 50px rgba(0, 255, 136, 0.15); }
  .banner { width: 100%; display: block; border-bottom: 3px solid #00ff88; }
  .content { padding: 45px 35px; text-align: left; color: #ffffff !important; }
  .alert-title { color: #00ff88 !important; font-size: 22px; font-weight: 900; text-shadow: 0 0 15px rgba(0, 255, 136, 0.3); letter-spacing: 2px; text-transform: uppercase; margin: 0; }
  .thanks-note { color: #00ff88 !important; font-size: 18px; font-weight: 700; margin-bottom: 10px; display: block; }
  
  .otp-box { 
    text-align: center; 
    margin: 35px 0; 
    background: linear-gradient(145deg, rgba(0, 255, 136, 0.1), rgba(0, 0, 0, 1)); 
    padding: 30px; 
    border-radius: 20px; 
    border: 1px dashed rgba(0, 255, 136, 0.3);
  }
  .otp-code { 
    display: inline-block; 
    color: #00ff88; 
    font-size: 36px; 
    letter-spacing: 8px; 
    font-weight: 900; 
    text-shadow: 0 0 10px rgba(0, 255, 136, 0.4);
  }

  .footer { background: #010101; padding: 35px; text-align: center; border-top: 1px solid #1a1a1a; }
  .admin-tag { color: #00ff88 !important; font-weight: 800; font-size: 16px; letter-spacing: 1px; }
  </style></head>

  <body class="email-body">
  <div class="card">

  <img src="https://i.ibb.co/wZS4wvv1/Green-burner-jpg.jpg" alt="Secure Verification" class="banner">

  <div class="content">
    <span class="thanks-note">Hi ${name}, Security Verification! 🔐</span>
    <h1 class="alert-title">VERIFICATION OTP</h1>

    <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin-top: 15px;">
      To complete your seller registration or login process, please use the following One-Time Password (OTP).
    </p>

    <div class="otp-box">
      <span class="otp-code">${otp}</span>
      <p style="color: #64748b; font-size: 12px; margin-top: 15px; letter-spacing: 1px;">
        Valid for the next <b>10 minutes</b> only.
      </p>
    </div>

    <p style="color: #64748b; font-size: 12px; text-align: center; font-style: italic;">
      If you did not request this code, please secure your account immediately. ✅
    </p>

    <!-- Invisible dynamic bridge to prevent Gmail collapsing -->
    <div style="display:none; white-space:nowrap; font-size:0px; line-height:0px;">
      Request-ID: ${requestId} | Generated-At: ${timestamp}
    </div>
  </div>

  <div class="footer">
    <div style="color: #64748b; font-size: 13px; line-height: 1.6;">
      Regards,<br>
      <span class="admin-tag">BR30 Security Team</span><br>
      Official Support & Security Division
    </div>

    <p style="color: #b1a5a5; font-size: 10px; margin-top: 20px; font-style: italic;">
      🚫 <b>Note:</b> This is a system-generated alert. Please <b>do not reply</b>.
    </p>

    <!-- SOCIAL LINKS -->
    <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #1a1a1a;">
      <p style="color: #00ff88; font-size: 11px; letter-spacing: 2px; margin-bottom: 15px;">
        STAY CON&#8203;NECTED WITH US 🚀
      </p>

      <a href="https://www.youtube.com" style="margin: 0 10px; text-decoration:none;">
        <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="22">
      </a>
      <a href="https://instagram.com" style="margin: 0 10px; text-decoration:none;">
        <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="22">
      </a>
      <a href="https://www.facebook.com/share/1DDJYGYYDf/" target="_blank" style="text-decoration:none;">
        <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="17" style="background:#1877F2; border-radius:50%; padding:3px; margin:0 5px;">
      </a>
      <a href="https://t.me" style="margin: 0 10px; text-decoration:none;">
        <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="22">
      </a>
      <a href="https://whatsapp.com" style="margin: 0 10px; text-decoration:none;">
        <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="22">
      </a>
    </div>

    <div style="margin-top:20px; color:#64748b; font-size:10px;">
      BR30 TRADER AUTOMATED SECURITY v2.5<br>
      System Node: ${requestId}
    </div>
  </div>
  </div>
  </body></html>
  `;
};

// Upgraded Seller Payout Template v2.5 (Gold Elite Theme)
const payoutTemplate = (data, courseRows) => {
  const uniqueId = Math.random().toString(36).substring(2, 12).toUpperCase();
  const timestamp = new Date().toLocaleString("en-IN");

  return `
  <!DOCTYPE html><html><head><meta charset="UTF-8"><style>
  .email-body { background-color: #000000 !important; padding: 40px 20px; font-family: 'Segoe UI', Arial, sans-serif; margin: 0; }
  .card { max-width: 600px; margin: auto; background: #050505; border-radius: 30px; border: 1px solid rgba(212, 175, 55, 0.4); overflow: hidden; box-shadow: 0 0 50px rgba(212, 175, 55, 0.15); }
  .banner { width: 100%; display: block; border-bottom: 3px solid #D4AF37; }
  .content { padding: 45px 35px; text-align: left; color: #ffffff !important; }
  .alert-title { color: #D4AF37 !important; font-size: 22px; font-weight: 900; text-shadow: 0 0 15px rgba(212, 175, 55, 0.3); letter-spacing: 2px; text-transform: uppercase; margin: 0; }
  .thanks-note { color: #D4AF37 !important; font-size: 18px; font-weight: 700; margin-bottom: 10px; display: block; }
  
  /* Table Styling */
  .payout-table { width: 100%; border-collapse: collapse; margin: 25px 0; background: rgba(255,255,255,0.02); border-radius: 12px; overflow: hidden; }
  .payout-table th { background: rgba(212, 175, 55, 0.1); color: #D4AF37; padding: 12px; font-size: 12px; text-transform: uppercase; text-align: left; }
  .payout-table td { padding: 12px; border-bottom: 1px solid #1a1a1a; color: #e2e8f0; font-size: 14px; }

  .summary-box { background: linear-gradient(145deg, rgba(212, 175, 55, 0.05), rgba(0, 0, 0, 1)); border: 1px solid rgba(212, 175, 55, 0.2); padding: 25px; border-radius: 15px; margin: 25px 0; line-height: 1.8; }
  .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; color: #e2e8f0; }
  .net-total { font-size: 20px; font-weight: 900; color: #00ff88; text-shadow: 0 0 10px rgba(0, 255, 136, 0.2); }

  .footer { background: #010101; padding: 35px; text-align: center; border-top: 1px solid #1a1a1a; }
  .admin-tag { color: #D4AF37 !important; font-weight: 800; font-size: 16px; letter-spacing: 1px; }
  </style></head>

  <body class="email-body">
  <div class="card">

  <img src="https://i.ibb.co/chKP57C1/gold-burner-jpg.jpg" alt="Payout Successful" class="banner">

  <div class="content">
    <span class="thanks-note">Hi ${data.sellerName}, Payment Sent! 💸</span>
    <h1 class="alert-title">PAYOUT PROCESSED</h1>

    <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin-top: 15px;">
      Great news! Your payout for the recent sales cycle has been successfully processed and initiated to your registered bank account.
    </p>

    <!-- Payout Breakdown Table -->
    <table class="payout-table">
      <thead>
        <tr>
          <th>Course Details</th>
          <th style="text-align: right;">Gross Amount</th>
        </tr>
      </thead>
      <tbody>
        ${courseRows}
      </tbody>
    </table>

    <!-- Final Summary Box -->
    <div class="summary-box">
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <span style="color: #94a3b8;">Total Sales Volume</span>
        <b style="color: #fff;">₹${data.totalSales.toLocaleString("en-IN")}</b>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #ff3e3e;">
        <span>Platform Commission (20%)</span>
        <b>- ₹${data.adminCommission.toLocaleString("en-IN")}</b>
      </div>

      <div style="border-top: 1px solid #222; margin: 15px 0;"></div>

      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: bold; color: #D4AF37;">NET PAYOUT AMOUNT</span>
        <span class="net-total">₹${data.netPayout.toLocaleString("en-IN")}</span>
      </div>
    </div>

    <p style="color: #64748b; font-size: 12px; text-align: center; font-style: italic;">
      Funds usually reflect in your account within 24-48 business hours. ✅
    </p>

    <!-- Invisible unique string for Gmail Anti-Collapsing -->
    <div style="display:none; white-space:nowrap; font-size:0px; line-height:0px;">
      Transaction-Ref: ${uniqueId} | Settlement-Time: ${timestamp}
    </div>
  </div>

  <div class="footer">
    <div style="color: #64748b; font-size: 13px; line-height: 1.6;">
      Regards,<br>
      <span class="admin-tag">BR30 Finance Team</span><br>
      Official Payout & Settlement Division
    </div>

    <p style="color: #b1a5a5; font-size: 10px; margin-top: 20px; font-style: italic;">
      🚫 <b>Note:</b> Automated settlement alert generated at ${timestamp} (Ref: ${uniqueId})
    </p>

    <!-- SOCIAL LINKS -->
    <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #1a1a1a;">
      <p style="color: #D4AF37; font-size: 11px; letter-spacing: 2px; margin-bottom: 15px;">
        STAY CON&#8203;NECTED WITH US 🚀
      </p>

      <a href="https://www.youtube.com" style="margin: 0 10px; text-decoration:none;">
        <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="22">
      </a>
      <a href="https://instagram.com" style="margin: 0 10px; text-decoration:none;">
        <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="22">
      </a>
      <a href="https://www.facebook.com/share/1DDJYGYYDf/" target="_blank" style="text-decoration:none;">
        <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="17" style="background:#1877F2; border-radius:50%; padding:3px; margin:0 5px;">
      </a>
      <a href="https://t.me" style="margin: 0 10px; text-decoration:none;">
        <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="22">
      </a>
      <a href="https://whatsapp.com" style="margin: 0 10px; text-decoration:none;">
        <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="22">
      </a>
    </div>

    <div style="margin-top:20px; color:#64748b; font-size:10px;">
      BR30 TRADER AUTOMATED SETTLEMENT v2.5<br>
      Batch ID: ${uniqueId.substring(0, 6)}
    </div>
  </div>
  </div>
  </body></html>
  `;
};

// Upgraded User Payment Failure Template v2.5
function getUserFailureTemplate(user, course, reason) {
  const uniqueId = Math.random().toString(36).substring(2, 12).toUpperCase();
  const timestamp = new Date().toLocaleString("en-IN");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
.email-body { background-color: #000000 !important; padding: 40px 20px; font-family: 'Segoe UI', Arial, sans-serif; margin: 0; }
.card { max-width: 600px; margin: auto; background: #050505; border-radius: 30px; border: 1px solid rgba(0, 255, 136, 0.4); overflow: hidden; box-shadow: 0 0 50px rgba(0, 255, 136, 0.15); }
.banner { width: 100%; display: block; border-bottom: 3px solid #00ff88; }
.content { padding: 45px 35px; text-align: left; color: #ffffff !important; }
.alert-title { color: #ff3e3e !important; font-size: 22px; font-weight: 900; text-shadow: 0 0 15px rgba(255, 62, 62, 0.4); letter-spacing: 2px; text-transform: uppercase; margin: 0; }
.thanks-note { color: #00ff88 !important; font-size: 18px; font-weight: 700; margin-bottom: 10px; display: block; text-shadow: 0 0 5px rgba(0, 255, 136, 0.3); }
.message-box { background: linear-gradient(145deg, rgba(0, 255, 136, 0.05), rgba(0, 0, 0, 1)); border-left: 5px solid #00ff88; padding: 25px; border-radius: 15px; box-shadow: inset 0 0 15px rgba(0, 255, 136, 0.05); line-height: 1.8; color: #e2e8f0 !important; font-size: 16px; margin: 25px 0; }
.support-btn { display: inline-block; padding: 15px 35px; background: #00ff88; color: #000000 !important; font-weight: 900; font-size: 16px; text-decoration: none; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 0 20px rgba(0, 255, 136, 0.4); margin-top: 10px; }
.footer { background: #010101; padding: 35px; text-align: center; border-top: 1px solid #1a1a1a; }
.admin-tag { color: #00ff88 !important; font-weight: 800; font-size: 16px; text-shadow: 0 0 5px #00ff88; letter-spacing: 1px; }
</style></head>

<body class="email-body">
<div class="card">

<img src="https://i.ibb.co/wZS4wvv1/Green-burner-jpg.jpg" alt="BR30 Official" class="banner">

<div class="content">
<span class="thanks-note">Hi ${user.name}, Thank you for your interest! 🚀</span>
<h1 class="alert-title">⚠️ PAYMENT NOT COMPLETED</h1>

<h3 style="color: #ffffff !important; font-size: 18px; margin-top: 20px; margin-bottom: 5px;">
Important Order Status Update
</h3>

<div class="message-box">
Sabse pehle, <b>${course.title}</b> mein interest dikhane ke liye bahut-bahut shukriya!
Hum aapko apne saath dekhne ke liye excited hain.<br><br>

Lekin humne dekha ki aapka purchase process poora nahi ho paaya.
Shayad network error ya bank server ki wajah se payment fail ho gaya hai.<br><br>

<span style="color: #ff3e3e; font-weight: bold;">
<b>Status:</b> ${reason || "Action Required"}
</span><br><br>

Chinta mat kijiye! Humari support team aapki help ke liye taiyar hai taaki aapki learning na ruke.
<b>Abhi contact kare niche diye gaye whatsapp Link pe...</b>
</div>

<div style="text-align: center; margin-top: 30px;">
<a href="https://wa.me{encodeURIComponent(course.title)}.%20RefID:%20${uniqueId}" class="support-btn">
TALK TO SUPPORT ON WHATSAPP
</a>
</div>

<p style="color: #94a3b8 !important; font-size: 13px; text-align: center; margin-top: 35px; font-style: italic;">
Humari team 24/7 aapki help ke liye available hai. ✅
</p>

<!-- Invisible dynamic bridge to prevent Gmail collapsing -->
<div style="display:none; white-space:nowrap; font-size:0px; line-height:0px;">
  Trace-ID: ${uniqueId} | Log-Time: ${timestamp}
</div>
</div>

<!-- ✅ FOOTER START -->
<div class="footer">

<div style="color: #64748b; font-size: 13px; line-height: 1.6;">
Regards,<br>
<span class="admin-tag">BR30 Support Team</span><br>
Official Support & Security Division
</div>

<p style="color: #b1a5a5; font-size: 10px; margin-top: 20px; font-style: italic;">
🚫 <b>Note:</b> Alert generated at ${timestamp} (Ref: ${uniqueId}). Please <b>do not reply</b>.
</p>

<!-- SOCIAL LINKS -->
<div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #1a1a1a;">
<p style="color: #00ff88; font-size: 11px; letter-spacing: 2px; margin-bottom: 15px;">
JOIN OUR COMMUNITY 🚀
</p>

<a href="https://www.youtube.com" style="margin: 0 10px; text-decoration:none;">
<img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="22">
</a>

<a href="https://www.instagram.com/br30traderofficial?igsh=MWN5eHBscWY5bXFvMw==" style="margin: 0 10px; text-decoration:none;">
<img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="22">
</a>

<a href="https://www.facebook.com/share/1DDJYGYYDf/" target="_blank" style="text-decoration:none;">
       <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
       width="17"
       style="background:#1877F2; border-radius:50%; padding:3px; margin:0 5px;">
</a>

<a href="https://t.me/+F8mDhdfiGaI1NDY1" style="margin: 0 10px; text-decoration:none;">
<img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="22">
</a>

<a href="https://chat.whatsapp.com/B4t82SWBcgOIZTeQXp1wDI" style="margin: 0 10px; text-decoration:none;">
<img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="22">
</a>
</div>

<!-- 🔥 FINAL FOOTER (SOCIAL KE NICHE) -->
<div style="margin-top:20px; color:#64748b; font-size:10px;">
BR30 TRADER AUTOMATED SYSTEM v2.5<br>
Security Division Alert ID: ${uniqueId}
</div>

</div>
<!-- ✅ FOOTER END -->

</div>
</body></html>`;
}

// Internal Support Alert Template v2.5 (No Social Links)
function getSupportFailureTemplate(user, course, reason) {
  const alertId = Math.random().toString(36).substring(2, 10).toUpperCase();
  const timestamp = new Date().toLocaleString("en-IN");

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        .email-body { background-color: #000000 !important; padding: 40px 20px; font-family: 'Segoe UI', sans-serif; margin: 0; }
        .card { 
            max-width: 600px; margin: auto; background: #050505; border-radius: 25px; 
            border: 1px solid rgba(255, 62, 62, 0.5); overflow: hidden; 
            box-shadow: 0 0 40px rgba(255, 62, 62, 0.15); 
        }
        .header { background: #ff3e3e; color: #ffffff; padding: 18px; text-align: center; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; font-size: 16px; }
        .content { padding: 35px; color: #ffffff !important; }
        
        .info-table { width: 100%; border-collapse: collapse; margin-top: 25px; background: rgba(255,255,255,0.02); border-radius: 12px; overflow: hidden; }
        .info-table td { padding: 15px; border-bottom: 1px solid #1a1a1a; font-size: 14px; }
        .label { color: #00ff88; font-weight: bold; width: 35%; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
        .value { color: #ffffff; font-weight: 500; }

        .action-box { 
            background: linear-gradient(145deg, rgba(0, 255, 136, 0.05), rgba(0, 0, 0, 1)); 
            border: 1px dashed #00ff88; 
            padding: 30px; border-radius: 20px; margin-top: 30px; text-align: center;
        }
        
        .reply-btn {
            display: inline-block; padding: 15px 30px; background: #00ff88; 
            color: #000000 !important; font-weight: 900; font-size: 14px; 
            text-decoration: none; border-radius: 10px; text-transform: uppercase;
            letter-spacing: 1px; box-shadow: 0 0 20px rgba(0, 255, 136, 0.4);
            transition: 0.3s;
        }

        .footer { background: #000000; padding: 25px; text-align: center; color: #64748b; font-size: 11px; line-height: 1.6; border-top: 1px solid #1a1a1a; }
        .id-tag { color: #333; font-size: 9px; margin-top: 10px; }
    </style>
</head>
<body class="email-body">
    <div class="card">
        <div class="header">🚨 INTERNAL ALERT: PAYMENT FAILURE</div>
        
        <div class="content">
            <p style="font-size: 15px; line-height: 1.6; color: #e2e8f0;">Team, a payment attempt has failed. Please reach out to the user to assist them in completing the purchase.</p>
            
            <table class="info-table">
                <tr>
                    <td class="label">USER NAME:</td>
                    <td class="value">${user.name}</td>
                </tr>
                <tr>
                    <td class="label">USER EMAIL:</td>
                    <td class="value">${user.email}</td>
                </tr>
                <tr>
                    <td class="label">COURSE TITLE:</td>
                    <td class="value">${course.title}</td>
                </tr>
                <tr>
                    <td class="label">FAILURE REASON:</td>
                    <td class="value" style="color: #ff3e3e; font-weight: bold;">${reason || "Technical Error / Abandoned"}</td>
                </tr>
            </table>

            <div class="action-box">
                <p style="color: #00ff88; margin-bottom: 15px; font-weight: 800; font-size: 13px; letter-spacing: 1px;">DIRECT RECOVERY PANEL</p>
                
                <a href="mailto:${user.email}?subject=Assistance Required: Your Enrollment in ${course.title}&body=Hi ${user.name}, we noticed your payment for ${course.title} was not completed. Need any help?" class="reply-btn">
                   📧 CONTACT USER NOW
                </a>
                
                <p style="font-size: 12px; margin-top: 15px; color: #64748b;">Click to compose a recovery email instantly.</p>
            </div>
        </div>

        <div class="footer">
            BR30 TRADER AUTOMATED SYSTEM v2.5<br>
            Official Support & Security Division<br>
            <div class="id-tag">
                Log ID: ${alertId} | Generated At: ${timestamp}
            </div>
        </div>
    </div>
</body>
</html>`;
}

// Upgraded Seller Account Approve Template v2.5
const approvalTemplate = (userName) => {
  const uniqueId = Math.random().toString(36).substring(2, 12).toUpperCase();
  const timestamp = new Date().toLocaleString("en-IN");

  return `
  <!DOCTYPE html><html><head><meta charset="UTF-8"><style>
  .email-body { background-color: #000000 !important; padding: 40px 20px; font-family: 'Segoe UI', Arial, sans-serif; margin: 0; }
  .card { max-width: 600px; margin: auto; background: #050505; border-radius: 30px; border: 1px solid rgba(0, 255, 136, 0.4); overflow: hidden; box-shadow: 0 0 50px rgba(0, 255, 136, 0.15); }
  .banner { width: 100%; display: block; border-bottom: 3px solid #00ff88; }
  .content { padding: 45px 35px; text-align: left; color: #ffffff !important; }
  .alert-title { color: #00ff88 !important; font-size: 22px; font-weight: 900; text-shadow: 0 0 15px rgba(0, 255, 136, 0.4); letter-spacing: 2px; text-transform: uppercase; margin: 0; }
  .thanks-note { color: #00ff88 !important; font-size: 18px; font-weight: 700; margin-bottom: 10px; display: block; text-shadow: 0 0 5px rgba(0, 255, 136, 0.3); }
  .message-box { background: linear-gradient(145deg, rgba(0, 255, 136, 0.05), rgba(0, 0, 0, 1)); border-left: 5px solid #00ff88; padding: 25px; border-radius: 15px; box-shadow: inset 0 0 15px rgba(0, 255, 136, 0.05); line-height: 1.8; color: #e2e8f0 !important; font-size: 16px; margin: 25px 0; }
  .support-btn { display: inline-block; padding: 15px 35px; background: #00ff88; color: #000000 !important; font-weight: 900; font-size: 16px; text-decoration: none; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 0 20px rgba(0, 255, 136, 0.4); margin-top: 10px; }
  .footer { background: #010101; padding: 35px; text-align: center; border-top: 1px solid #1a1a1a; }
  .admin-tag { color: #00ff88 !important; font-weight: 800; font-size: 16px; text-shadow: 0 0 5px #00ff88; letter-spacing: 1px; }
  </style></head>

  <body class="email-body">
  <div class="card">

  <img src="https://i.ibb.co/wZS4wvv1/Green-burner-jpg.jpg" alt="BR30 Official" class="banner">

  <div class="content">
  <span class="thanks-note">Hi ${userName}, Congratulations! 🚀</span>
  <h1 class="alert-title">✅ APPLICATION APPROVED</h1>

  <h3 style="color: #ffffff !important; font-size: 18px; margin-top: 20px; margin-bottom: 5px;">
  Welcome to the BR30 Elite Seller Program
  </h3>

  <div class="message-box">
  Humein ye batate huye bahut khushi ho rahi hai ki aapka <b>Seller Account</b> review ke baad approve kar diya gaya hai!<br><br>

  Ab aap <b>BR30 Trader Platform</b> par apne digital assets aur courses sell karne ke liye poori tarah ready hain.<br><br>

  <span style="color: #00ff88; font-weight: bold;">
  <b>Status:</b> Active & Verified ✅
  </span><br><br>

  Abhi apne Dashboard mein login karein aur apna pehla content publish karein. Hum aapki success ke liye excited hain!
  </div>

  <div style="text-align: center; margin-top: 30px;">
  <a href="https://br30trader.com" class="support-btn">
  OPEN SELLER DASHBOARD
  </a>
  </div>

  <p style="color: #94a3b8 !important; font-size: 13px; text-align: center; margin-top: 35px; font-style: italic;">
  Aapka trading journey hamare saath ab shuru hota hai! ✅
  </p>

  <!-- Invisible unique bridge to prevent Gmail collapsing -->
  <div style="display:none; white-space:nowrap; font-size:0px; line-height:0px;">
    Activation-ID: ${uniqueId} | Auth-Sync: ${timestamp}
  </div>
  </div>

  <!-- ✅ FOOTER START -->
  <div class="footer">

  <div style="color: #64748b; font-size: 13px; line-height: 1.6;">
  Regards,<br>
  <span class="admin-tag">BR30 Support Team</span><br>
  Official Support & Security Division
  </div>

  <p style="color: #b1a5a5; font-size: 10px; margin-top: 20px; font-style: italic;">
  🚫 <b>Note:</b> Account verified at ${timestamp} (Ref: ${uniqueId})
  </p>

  <!-- SOCIAL LINKS -->
  <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #1a1a1a;">
  <p style="color: #00ff88; font-size: 11px; letter-spacing: 2px; margin-bottom: 15px;">
  JOIN OUR COMMU&#8203;NITY 🚀
  </p>

  <a href="https://www.youtube.com" style="margin: 0 10px; text-decoration:none;">
    <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="22">
  </a>

  <a href="https://www.instagram.com/br30traderofficial" style="margin: 0 10px; text-decoration:none;">
    <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="22">
  </a>

  <a href="https://www.facebook.com/share/1DDJYGYYDf/" target="_blank" style="text-decoration:none;">
       <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
       width="17"
       style="background:#1877F2; border-radius:50%; padding:3px; margin:0 5px;">
  </a>

  <a href="https://t.me/+F8mDhdfiGaI1NDY1" style="margin: 0 10px; text-decoration:none;">
    <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="22">
  </a>

  <a href="https://chat.whatsapp.com/B4t82SWBcgOIZTeQXp1wDI" style="margin: 0 10px; text-decoration:none;">
    <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="22">
  </a>
  </div>

  <div style="margin-top:20px; color:#64748b; font-size:10px;">
  BR30 TRADER AUTOMATED SYSTEM v2.5<br>
  Access Key: ${uniqueId}
  </div>

  </div>
  </div>
  </body></html>
  `;
};

// seller application reject templet
const rejectSellerTemplate = (userName, reason) => {
  // Har mail ke liye unique ID
  const uniqueId = Math.random().toString(36).substring(2, 15);
  const timestamp = new Date().toLocaleString("en-IN");

  return `
  <!DOCTYPE html><html><head><meta charset="UTF-8"><style>
  .email-body { background-color: #000000; padding: 40px 20px; font-family: sans-serif; margin: 0; }
  .card { max-width: 600px; margin: auto; background: #050505; border-radius: 30px; border: 1px solid rgba(255, 62, 62, 0.4); overflow: hidden; box-shadow: 0 0 50px rgba(255, 62, 62, 0.15); }
  .banner { width: 100%; display: block; border-bottom: 3px solid #ff3e3e; }
  .content { padding: 45px 35px; text-align: left; color: #ffffff !important; }
  .alert-title { color: #ff3e3e !important; font-size: 22px; font-weight: 900; text-shadow: 0 0 15px rgba(255, 62, 62, 0.4); letter-spacing: 2px; text-transform: uppercase; margin: 0; }
  .thanks-note { color: #ff3e3e !important; font-size: 18px; font-weight: 700; margin-bottom: 10px; display: block; text-shadow: 0 0 5px rgba(255, 62, 62, 0.3); }
  .message-box { background: linear-gradient(145deg, rgba(255, 62, 62, 0.05), rgba(0, 0, 0, 1)); border-left: 5px solid #ff3e3e; padding: 25px; border-radius: 15px; box-shadow: inset 0 0 15px rgba(255, 62, 62, 0.05); line-height: 1.8; color: #e2e8f0 !important; font-size: 16px; margin: 25px 0; }
  .support-btn { display: inline-block; padding: 15px 35px; background: #ff3e3e; color: #000000 !important; font-weight: 900; font-size: 16px; text-decoration: none; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 0 20px rgba(255, 62, 62, 0.4); margin-top: 10px; }
  .footer { background: #010101; padding: 35px; text-align: center; border-top: 1px solid #222; }
  .admin-tag { color: #ff3e3e !important; font-weight: 800; font-size: 16px; text-shadow: 0 0 5px #ff3e3e; letter-spacing: 1px; }
  </style></head>

  <body class="email-body">
  <div class="card">

  <img src="https://i.ibb.co/wZS4wvv1/Green-burner-jpg.jpg" alt="BR30 Official" class="banner">

  <div class="content">
  <span class="thanks-note">Hi ${userName}, Update on your Application 🚨</span>
  <h1 class="alert-title">❌ APPLICATION REJECTED</h1>

  <h3 style="color: #ffffff !important; font-size: 18px; margin-top: 20px; margin-bottom: 5px;">
  Documents Verification Failed
  </h3>

  <div class="message-box">
  Humein ye batate huye khed hai ki review process ke dauran aapke <b>Seller Account</b> ki details verify nahi ho paayi hain.<br><br>

  Is wajah se aapki application ko abhi ke liye reject kar diya gaya hai. Kripya niche diye gaye reasons ko dhyan se dekhein:<br><br>

  <span style="color: #ff3e3e; white-space: pre-line;">
  <b>Reason(s):</b><br>${reason}
  </span><br><br>

  Aap apni details ko dashboard mein jaakar correct kar sakte hain aur fir se re-apply kar sakte hain.
  </div>

  <div style="text-align: center; margin-top: 30px;">
  <a href="https://br30trader.com" class="support-btn">
  RE-UPLOAD DOCUMENTS
  </a>
  </div>

  <p style="color: #94a3b8 !important; font-size: 13px; text-align: center; margin-top: 35px; font-style: italic;">
  Kripya sahi documents ke sath fir se apply karein. ✅
  </p>
  
  <!-- Invisible Unique String for Gmail -->
  <div style="display:none; white-space:nowrap; font-size:0px; line-height:0px;">
    Notification-ID: ${uniqueId} | Sync-Time: ${timestamp}
  </div>

  </div>

  <div class="footer">
  <div style="color: #64748b; font-size: 13px; line-height: 1.6;">
  Regards,<br>
  <span class="admin-tag">BR30 Support Team</span><br>
  Official Support & Security Division
  </div>

  <p style="color: #b1a5a5; font-size: 10px; margin-top: 20px; font-style: italic;">
  🚫 <b>Note:</b> System Alert Logged at ${timestamp} (Ref: ${uniqueId})
  </p>

  <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #1a1a1a;">
  <p style="color: #ff3e3e; font-size: 11px; letter-spacing: 2px; margin-bottom: 15px;">
  STAY CON&#8203;NECTED WITH US 🚀
  </p>

  <a href="https://www.youtube.com" style="margin: 0 10px; text-decoration:none;">
    <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="22">
  </a>

  <a href="https://www.instagram.com/br30traderofficial" style="margin: 0 10px; text-decoration:none;">
    <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="22">
  </a>

  <a href="https://facebook.com" target="_blank" style="text-decoration:none;">
       <img src="https://flaticon.com"
       width="17"
       style="background:#1877F2; border-radius:50%; padding:3px; margin:0 5px;">
    </a>

  <a href="https://t.me/+F8mDhdfiGaI1NDY1" style="margin: 0 10px; text-decoration:none;">
    <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="22">
  </a>

  <a href="https://chat.whatsapp.com/B4t82SWBcgOIZTeQXp1wDI" style="margin: 0 10px; text-decoration:none;">
    <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="22">
  </a>
  </div>

  <div style="margin-top:20px; color:#64748b; font-size:10px;">
  BR30 TRADER AUTOMATED SYSTEM v2.5<br>
  Auth Token: ${uniqueId.toUpperCase()}
  </div>
  </div>
  </div>
  </body></html>
  `;
};

// Upgraded Seller Doc Reject Template v2.5
const rejectDocsTemplate = (userName, reason) => {
  const uniqueId = Math.random().toString(36).substring(2, 12).toUpperCase();
  const timestamp = new Date().toLocaleString("en-IN");

  return `
  <!DOCTYPE html><html><head><meta charset="UTF-8"><style>
  .email-body { background-color: #000000 !important; padding: 40px 20px; font-family: 'Segoe UI', Arial, sans-serif; margin: 0; }
  .card { max-width: 600px; margin: auto; background: #050505; border-radius: 30px; border: 1px solid rgba(255, 62, 62, 0.4); overflow: hidden; box-shadow: 0 0 50px rgba(255, 62, 62, 0.15); }
  .banner { width: 100%; display: block; border-bottom: 3px solid #ff3e3e; }
  .content { padding: 45px 35px; text-align: left; color: #ffffff !important; }
  .alert-title { color: #ff3e3e !important; font-size: 22px; font-weight: 900; text-shadow: 0 0 15px rgba(255, 62, 62, 0.4); letter-spacing: 2px; text-transform: uppercase; margin: 0; }
  .thanks-note { color: #ff3e3e !important; font-size: 18px; font-weight: 700; margin-bottom: 10px; display: block; text-shadow: 0 0 5px rgba(255, 62, 62, 0.3); }
  .message-box { background: linear-gradient(145deg, rgba(255, 62, 62, 0.05), rgba(0, 0, 0, 1)); border-left: 5px solid #ff3e3e; padding: 25px; border-radius: 15px; box-shadow: inset 0 0 15px rgba(255, 62, 62, 0.05); line-height: 1.8; color: #e2e8f0 !important; font-size: 16px; margin: 25px 0; }
  .support-btn { display: inline-block; padding: 15px 35px; background: #ff3e3e; color: #000000 !important; font-weight: 900; font-size: 16px; text-decoration: none; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 0 20px rgba(255, 62, 62, 0.4); margin-top: 10px; }
  .footer { background: #010101; padding: 35px; text-align: center; border-top: 1px solid #1a1a1a; }
  .admin-tag { color: #ff3e3e !important; font-weight: 800; font-size: 16px; text-shadow: 0 0 5px #ff3e3e; letter-spacing: 1px; }
  </style></head>

  <body class="email-body">
  <div class="card">

  <img src="https://i.ibb.co/wZS4wvv1/Green-burner-jpg.jpg" alt="BR30 Official" class="banner">

  <div class="content">
  <span class="thanks-note">Hi ${userName}, Action Required 🚨</span>
  <h1 class="alert-title">❌ DOCUMENTS REJECTED</h1>

  <h3 style="color: #ffffff !important; font-size: 18px; margin-top: 20px; margin-bottom: 5px;">
  KYC & Verification Update
  </h3>

  <div class="message-box">
  Our review team has identified issues with your submitted documents. Verification could not be completed at this time.<br><br>

  Please review the following reason(s) for document rejection:<br><br>

  <span style="color: #ff3e3e; white-space: pre-line; font-weight: bold;">
  <b>Reason(s):</b><br>• ${reason}
  </span><br><br>

  Kindly re-upload clear and valid documents through your dashboard to proceed with your application.
  </div>

  <div style="text-align: center; margin-top: 30px;">
  <a href="https://br30trader.com" class="support-btn">
  RE-UPLOAD CLEAR DOCUMENTS
  </a>
  </div>

  <p style="color: #94a3b8 !important; font-size: 13px; text-align: center; margin-top: 35px; font-style: italic;">
  Unverified accounts may face temporary restrictions. ✅
  </p>
  
  <!-- Invisible unique bridge to prevent Gmail collapsing -->
  <div style="display:none; white-space:nowrap; font-size:0px; line-height:0px;">
    System-Log-ID: ${uniqueId} | Sync-Stamp: ${timestamp}
  </div>
  </div>

  <div class="footer">
  <div style="color: #64748b; font-size: 13px; line-height: 1.6;">
  Regards,<br>
  <span class="admin-tag">BR30 Support Team</span><br>
  Official Support & Security Division
  </div>

  <p style="color: #b1a5a5; font-size: 10px; margin-top: 20px; font-style: italic;">
  🚫 <b>Note:</b> Security Incident Logged at ${timestamp} (Ref: ${uniqueId})
  </p>

  <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #1a1a1a;">
  <p style="color: #ff3e3e; font-size: 11px; letter-spacing: 2px; margin-bottom: 15px;">
  STAY CON&#8203;NECTED WITH US 🚀
  </p>

  <a href="https://www.youtube.com" style="margin: 0 10px; text-decoration:none;">
    <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="22">
  </a>

  <a href="https://www.instagram.com/br30traderofficial" style="margin: 0 10px; text-decoration:none;">
    <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="22">
  </a>

  <a href="https://facebook.com" target="_blank" style="text-decoration:none;">
       <img src="https://flaticon.com"
       width="17"
       style="background:#1877F2; border-radius:50%; padding:3px; margin:0 5px;">
  </a>

  <a href="https://t.me/+F8mDhdfiGaI1NDY1" style="margin: 0 10px; text-decoration:none;">
    <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="22">
  </a>

  <a href="https://chat.whatsapp.com/B4t82SWBcgOIZTeQXp1wDI" style="margin: 0 10px; text-decoration:none;">
    <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="22">
  </a>
  </div>

  <div style="margin-top:20px; color:#64748b; font-size:10px;">
  BR30 TRADER AUTOMATED SYSTEM v2.5<br>
  Security Auth Hash: ${uniqueId}
  </div>
  </div>
  </div>
  </body></html>
  `;
};

// Upgraded VIP Certificate Template v2.5
const vipCertTemplate = (userName, certUrl, certId) => {
  const syncId = Math.random().toString(36).substring(2, 12).toUpperCase();
  const timestamp = new Date().toLocaleString("en-IN");

  return `
  <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        .email-body { background-color: #000000 !important; padding: 40px 20px; font-family: 'Segoe UI', sans-serif; margin: 0; }
        .card { max-width: 600px; margin: auto; background: #050505; border-radius: 30px; border: 2px solid #00ff88; overflow: hidden; box-shadow: 0 0 50px rgba(0, 255, 136, 0.2); }
        .banner { width: 100%; display: block; border-bottom: 3px solid #00ff88; }
        .content { padding: 45px 35px; text-align: left; color: #ffffff !important; }
        .alert-title { color: #00ff88 !important; font-size: 24px; font-weight: 900; text-shadow: 0 0 15px rgba(0, 255, 136, 0.6); letter-spacing: 3px; text-transform: uppercase; margin: 0; }
        
        .vip-box { 
            background: linear-gradient(145deg, rgba(0,255,136,0.1), rgba(0,0,0,1));
            border-left: 5px solid #00ff88; padding: 25px; border-radius: 15px; 
            line-height: 1.8; color: #e2e8f0 !important; font-size: 16px; margin: 25px 0;
        }

        .download-btn {
            display: inline-block; padding: 15px 35px; background: #00ff88; 
            color: #000000 !important; font-weight: 900; font-size: 15px; 
            text-decoration: none; border-radius: 12px; text-transform: uppercase;
            letter-spacing: 1px; box-shadow: 0 0 20px rgba(0, 255, 136, 0.4);
            margin-top: 10px;
        }

        .footer { background: #010101; padding: 35px; text-align: center; border-top: 1px solid #1a1a1a; }
        .admin-tag { color: #00ff88 !important; font-weight: 800; font-size: 16px; text-shadow: 0 0 5px #00ff88; }
    </style>
</head>
<body class="email-body">
    <div class="card">
        <img src="https://i.ibb.co/wZS4wvv1/Green-burner-jpg.jpg" alt="BR30 VIP Official" class="banner">
        
        <div class="content">
            <h1 class="alert-title">🏆 CERTIFICATE READY</h1>
            
            <h3 style="color: #ffffff !important; font-size: 20px; margin-top: 25px; margin-bottom: 10px;">
                Congratulations ${userName}! 🚀
            </h3>
            
            <div class="vip-box">
                Humein ye batate huye bahut garv ho raha hai ki aapne apna training course successfully complete kar liya hai. Aapka official certificate generate ho gaya hai.<br><br>
                <span style="color: #00ff88; font-weight: bold;">
                    📜 Certificate ID: ${certId}
                </span>
            </div>
           <p style="color: #e2e8f0; font-size: 15px; margin-bottom: 20px;">
             Aapka digitally verified certificate niche diye gaye link se download kiya ja sakta hai. Ise apne social media par share karna na bhoolein:
            </p>

            <div style="text-align: center; margin-top: 20px;">
              <!-- Cloudinary Link Yahan Kaam Karega -->
              <a href="${certUrl}" class="download-btn">DOWNLOAD CERTIFICATE 📥</a>
             </div>

              <p style="color: #00ff88; font-size: 12px; text-align: center; margin-top: 15px; font-weight: bold; letter-spacing: 1px;">
             🚀 SECURE ACCESS: VERIFIED BY BR30 ACADEMY
            </p>
            
            <p style="color: #94a3b8 !important; font-size: 13px; text-align: center; margin-top: 40px; font-style: italic;">
                <b>Note:</b> Ye certificate aapki permanent achievement hai. ✅
            </p>

            <!-- Invisible unique bridge for Gmail auto-show -->
            <div style="display:none; white-space:nowrap; font-size:0px; line-height:0px;">
              Cert-Sync-ID: ${syncId} | Timestamp: ${timestamp}
            </div>
        </div>

        <div class="footer">
            <div style="color: #64748b; font-size: 13px; line-height: 1.6;">
                Regards,<br>
                <span class="admin-tag">BR30 Support Team</span><br>
                Academic Verification Division
            </div>

            <p style="color: #65748a; font-size: 10px; margin-top: 15px; font-style: italic; letter-spacing: 1px;">
                🚫 <b>OFFICIAL NOTE:</b> Auto-generated at ${timestamp} (Ref: ${syncId})
            </p>

            <!-- 🚀 Social Links -->
            <div style="margin-top:25px;padding-top:20px;border-top:1px solid #1a1a1a;">
                <p style="color:#00ff88;font-size:11px;letter-spacing:2px;margin-bottom:15px;">
                    JOIN OUR COMMU​NITY 🚀
                </p>
                <a href="https://www.youtube.com" target="_blank" style="text-decoration:none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="22" style="margin:0 5px;">
                </a>
                <a href="https://www.instagram.com/br30traderofficial" target="_blank" style="text-decoration:none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="22" style="margin:0 5px;">
                </a>
                <a href="https://www.facebook.com/share/1DDJYGYYDf/" target="_blank" style="text-decoration:none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="17" style="background:#1877F2; border-radius:50%; padding:3px; margin:0 5px;">
                </a>
                <a href="https://t.me/+F8mDhdfiGaI1NDY1" target="_blank" style="text-decoration:none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="22" style="margin:0 5px;">
                </a>
                <a href="https://chat.whatsapp.com/B4t82SWBcgOIZTeQXp1wDI" target="_blank" style="text-decoration:none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="22" style="margin:0 5px;">
                </a>
            </div>
            
            <div style="margin-top: 10px; font-size: 10px; color: #64748b; letter-spacing: 1px; text-align: center;">
                DIGITAL HASH: ${syncId.substring(0, 8)} | © BR30ᴛʀᴀᴅᴇʀ
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

// 📢 UPGRADED SELLER ALERT TEMPLATE v2.5
const sellerAlertTemplate = (userName, alertMessage) => {
  const syncId = Math.random().toString(36).substring(2, 12).toUpperCase();
  const timestamp = new Date().toLocaleString("en-IN");

  return `
  <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        .email-body { background-color: #000000 !important; padding: 40px 20px; font-family: 'Segoe UI', sans-serif; margin: 0; }
        .card { max-width: 600px; margin: auto; background: #050505; border-radius: 30px; border: 2px solid #00ff88; overflow: hidden; box-shadow: 0 0 50px rgba(0, 255, 136, 0.2); }
        .banner { width: 100%; display: block; border-bottom: 3px solid #00ff88; }
        .content { padding: 45px 35px; text-align: left; color: #ffffff !important; }
        .alert-title { color: #00ff88 !important; font-size: 24px; font-weight: 900; text-shadow: 0 0 15px rgba(0, 255, 136, 0.6); letter-spacing: 3px; text-transform: uppercase; margin: 0; }
        
        .alert-box { 
            background: linear-gradient(145deg, rgba(0,255,136,0.1), rgba(0,0,0,1));
            border-left: 5px solid #00ff88; padding: 25px; border-radius: 15px; 
            line-height: 1.8; color: #e2e8f0 !important; font-size: 16px; margin: 25px 0;
            box-shadow: inset 0 0 20px rgba(0,255,136,0.05);
        }

        .action-btn {
            display: inline-block; padding: 15px 35px; background: #00ff88; 
            color: #000000 !important; font-weight: 900; font-size: 15px; 
            text-decoration: none; border-radius: 12px; text-transform: uppercase;
            letter-spacing: 1px; box-shadow: 0 0 20px rgba(0, 255, 136, 0.4);
            margin-top: 10px;
        }

        .footer { background: #010101; padding: 35px; text-align: center; border-top: 1px solid #1a1a1a; }
        .admin-tag { color: #00ff88 !important; font-weight: 800; font-size: 16px; text-shadow: 0 0 5px #00ff88; }
    </style>
</head>
<body class="email-body">
    <div class="card">
        <img src="https://i.ibb.co/wZS4wvv1/Green-burner-jpg.jpg" alt="BR30 Admin Alert" class="banner">
        
        <div class="content">
            <h1 class="alert-title">📢 ADMIN ALERT</h1>
            
            <h3 style="color: #ffffff !important; font-size: 20px; margin-top: 25px; margin-bottom: 10px;">
                Important Notice for ${userName} 🚀
            </h3>
            
            <div class="alert-box">
                <b>Bhai, Admin ki taraf se aapke liye ek zaroori message hai:</b><br><br>
                <span style="color: #00ff88; font-weight: bold; font-size: 18px;">
                    "${alertMessage}"
                </span>
            </div>
           <p style="color: #e2e8f0; font-size: 15px; margin-bottom: 20px;">
             Is message ko dhyan se padhein aur agar koi action required hai toh turant apne dashboard par jaakar update karein.
            </p>

            <div style="text-align: center; margin-top: 20px;">
              <a href="https://vercel.app" class="action-btn">GO TO DASHBOARD 🚀</a>
             </div>

              <p style="color: #00ff88; font-size: 12px; text-align: center; margin-top: 15px; font-weight: bold; letter-spacing: 1px;">
             🚀 SECURE NODE: DIRECT ADMIN COMMUNICATION
            </p>
            
            <p style="color: #94a3b8 !important; font-size: 13px; text-align: center; margin-top: 40px; font-style: italic;">
                <b>Note:</b> Ye message aapki profile improvement ke liye bheja gaya hai. ✅
            </p>

            <!-- Invisible trace for Gmail anti-collapse -->
            <div style="display:none; white-space:nowrap; font-size:0px; line-height:0px;">
              Sync-Protocol-ID: ${syncId} | Time: ${timestamp}
            </div>
        </div>

        <div class="footer">
            <div style="color: #64748b; font-size: 13px; line-height: 1.6;">
                Regards,<br>
                <span class="admin-tag">Mukesh Raj (MASTER ADMIN)</span><br>
                BR30ᴛʀᴀᴅᴇʀ Support Division
            </div>

            <p style="color: #65748a; font-size: 10px; margin-top: 15px; font-style: italic; letter-spacing: 1px;">
                🚫 <b>OFFICIAL NOTE:</b> Auto-dispatched at ${timestamp} (Ref: ${syncId})
            </p>

            <!-- 🚀 Social Links (Same as your brand) -->
            <div style="margin-top:25px;padding-top:20px;border-top:1px solid #1a1a1a;">
                <p style="color:#00ff88;font-size:11px;letter-spacing:2px;margin-bottom:15px;">
                    JOIN OUR COMMU&#8203;NITY 🚀
                </p>
                <a href="https://www.youtube.com" target="_blank" style="text-decoration:none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="22" style="margin:0 5px;">
                </a>
                <a href="https://www.instagram.com/br30traderofficial" target="_blank" style="text-decoration:none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="22" style="margin:0 5px;">
                </a>
                <a href="https://www.facebook.com/share/1DDJYGYYDf/" target="_blank" style="text-decoration:none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="17" style="background:#1877F2; border-radius:50%; padding:3px; margin:0 5px;">
                </a>
                <a href="https://t.me/+F8mDhdfiGaI1NDY1" target="_blank" style="text-decoration:none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="22" style="margin:0 5px;">
                </a>
                <a href="https://chat.whatsapp.com/B4t82SWBcgOIZTeQXp1wDI" target="_blank" style="text-decoration:none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="22" style="margin:0 5px;">
                </a>
            </div>
            
            <div style="margin-top: 10px; font-size: 10px; color: #64748b; letter-spacing: 1px; text-align: center;">
                SYSTEM NODE: ${syncId.substring(0, 8)} | © BR30ᴛʀᴀᴅᴇʀ
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

// seller alart message (course managment pennel)
const sellerAlertTemplate2 = (data) => {
  // 🚩 Safely extract data
  const userName = data.userName || "Valued Seller";
  const reason = data.reason || "Admin Update";
  const alertMessage = data.alertMessage || "Please check your dashboard.";

  // 🔑 Generate IDs inside to avoid 'undefined' errors
  const timestamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
  const syncId = Math.random().toString(36).substring(2, 10).toUpperCase();

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        .email-body { background-color: #000000 !important; padding: 40px 20px; font-family: 'Segoe UI', sans-serif; margin: 0; }
        .card { max-width: 600px; margin: auto; background: #050505; border-radius: 30px; border: 2px solid #00ff88; overflow: hidden; box-shadow: 0 0 50px rgba(0, 255, 136, 0.2); }
        .banner { width: 100%; display: block; border-bottom: 3px solid #00ff88; }
        .content { padding: 45px 35px; text-align: left; color: #ffffff !important; }
        .alert-title { color: #00ff88 !important; font-size: 24px; font-weight: 900; text-shadow: 0 0 15px rgba(0, 255, 136, 0.6); letter-spacing: 3px; text-transform: uppercase; margin: 0; }
        
        .alert-box { 
            background: linear-gradient(145deg, rgba(0,255,136,0.1), rgba(0,0,0,1));
            border-left: 5px solid #00ff88; padding: 25px; border-radius: 15px; 
            line-height: 1.8; color: #e2e8f0 !important; font-size: 16px; margin: 25px 0;
            box-shadow: inset 0 0 20px rgba(0,255,136,0.05);
        }

        .action-btn {
            display: inline-block; padding: 15px 35px; background: #00ff88; 
            color: #000000 !important; font-weight: 900; font-size: 15px; 
            text-decoration: none; border-radius: 12px; text-transform: uppercase;
            letter-spacing: 1px; box-shadow: 0 0 20px rgba(0, 255, 136, 0.4);
            margin-top: 10px;
        }

        .footer { background: #010101; padding: 35px; text-align: center; border-top: 1px solid #1a1a1a; }
        .admin-tag { color: #00ff88 !important; font-weight: 800; font-size: 16px; text-shadow: 0 0 5px #00ff88; }
    </style>
</head>
<body class="email-body">
    <div class="card">
        <!-- 🖼️ Banner (Wahi purana wala) -->
        <img src="https://i.ibb.co/wZS4wvv1/Green-burner-jpg.jpg" alt="BR30 Admin Alert" class="banner">
        
        <div class="content">
            <h1 class="alert-title">📢 ADMIN ACTION ALERT</h1>
            
            <h3 style="color: #ffffff !important; font-size: 20px; margin-top: 25px; margin-bottom: 10px;">
                Important Notice for ${userName} 🚀
            </h3>
            
            <div class="alert-box">
                <b style="color: #00ff88;">Action Reason:</b><br>
                <span style="font-size: 20px; font-weight: 900; text-transform: uppercase;">
                    ${reason}
                </span>
                <br><br>
                <b style="color: #00ff88;">Admin Message:</b><br>
                <span style="color: #e2e8f0;">
                    "${alertMessage}"
                </span>
            </div>

           <p style="color: #e2e8f0; font-size: 15px; margin-bottom: 20px;">
             Bhai, admin ne aapke course par action liya hai. Please is message ko dhyan se padhein aur zaroori badlav apne dashboard par jaakar turant karein.
            </p>

            <div style="text-align: center; margin-top: 20px;">
              <a href="https://vercel.app" class="action-btn">GO TO DASHBOARD 🚀</a>
             </div>

              <p style="color: #00ff88; font-size: 12px; text-align: center; margin-top: 15px; font-weight: bold; letter-spacing: 1px;">
             🚀 SECURE NODE: DIRECT ADMIN COMMUNICATION
            </p>
            
            <p style="color: #94a3b8 !important; font-size: 13px; text-align: center; margin-top: 40px; font-style: italic;">
                <b>Note:</b> Ye notification system transparency ke liye bheja gaya hai. ✅
            </p>

            <!-- Invisible trace for Gmail -->
            <div style="display:none; white-space:nowrap; font-size:0px; line-height:0px;">
              Sync-Protocol-ID: ${syncId} | Time: ${timestamp}
            </div>
        </div>

        <div class="footer">
            <div style="color: #64748b; font-size: 13px; line-height: 1.6;">
                Regards,<br>
                <span class="admin-tag">Mukesh Raj (MASTER ADMIN)</span><br>
                BR30ᴛʀᴀᴅᴇʀ Support Division
            </div>

            <p style="color: #65748a; font-size: 10px; margin-top: 15px; font-style: italic; letter-spacing: 1px;">
                🚫 <b>OFFICIAL NOTE:</b> Auto-dispatched at ${timestamp} (Ref: ${syncId})
            </p>

            <!-- 🚀 Social Links (Same as your brand) -->
            <div style="margin-top:25px;padding-top:20px;border-top:1px solid #1a1a1a;">
                <p style="color:#00ff88;font-size:11px;letter-spacing:2px;margin-bottom:15px;">
                    JOIN OUR COMMUNITY 🚀
                </p>
                <a href="https://www.youtube.com" target="_blank" style="text-decoration:none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="22" style="margin:0 5px;">
                </a>
                <a href="https://www.instagram.com/br30traderofficial" target="_blank" style="text-decoration:none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="22" style="margin:0 5px;">
                </a>
                <a href="https://www.facebook.com/share/1DDJYGYYDf/" target="_blank" style="text-decoration:none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="17" style="background:#1877F2; border-radius:50%; padding:3px; margin:0 5px;">
                </a>
                <a href="https://t.me/+F8mDhdfiGaI1NDY1" target="_blank" style="text-decoration:none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="22" style="margin:0 5px;">
                </a>
                <a href="https://chat.whatsapp.com/B4t82SWBcgOIZTeQXp1wDI" target="_blank" style="text-decoration:none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="22" style="margin:0 5px;">
                </a>
            </div>
            
            <div style="margin-top: 10px; font-size: 10px; color: #64748b; letter-spacing: 1px; text-align: center;">
                SYSTEM NODE: ${syncId.substring(0, 8)} | © BR30ᴛʀᴀᴅᴇʀ
            </div>
        </div>
    </div>
</body>
</html>
    `;
};

// pement fail support team ko mail
module.exports = {
  sendEmail,
  registerOtpTemplate,
  forgotPasswordTemplate,
  sellerForgotPasswordTemplate,
  sellerOtpTemplate,
  payoutTemplate,
  approvalTemplate,
  rejectSellerTemplate,
  rejectDocsTemplate,
  vipCertTemplate,
  getSupportFailureTemplate,
  getUserFailureTemplate,
  sellerAlertTemplate,
  sellerAlertTemplate2,
};
