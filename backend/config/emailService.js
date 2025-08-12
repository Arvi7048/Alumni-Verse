const nodemailer = require("nodemailer")
const crypto = require("crypto")

// Create transporter
const createTransporter = () => {
  console.log('Creating email transporter with:')
  console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE)
  console.log('EMAIL_USER:', process.env.EMAIL_USER)
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '[SET]' : '[NOT SET]')
  
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

// Generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString()
}

// Send OTP email
const sendOTPEmail = async (email, otp, type) => {
  const transporter = createTransporter()
  
  let subject, html
  
  switch (type) {
    case "registration":
      subject = "Verify Your Email - Alumni Platform"
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Alumni Platform!</h2>
          <p>Thank you for registering. Please verify your email address using the OTP below:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 36px; margin: 0;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
      break
    
    case "forgot_password":
      subject = "Reset Your Password - Alumni Platform"
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested to reset your password. Use the OTP below to proceed:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #dc3545; font-size: 36px; margin: 0;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
        </div>
      `
      break
    
    case "email_verification":
      subject = "Verify Your Email - Alumni Platform"
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Please verify your email address using the OTP below:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #28a745; font-size: 36px; margin: 0;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
      break
  }

  const mailOptions = {
    from: `"Alumni Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
  }

  try {
    console.log('Attempting to send email to:', email)
    console.log('Email subject:', subject)
    const result = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', result.messageId)
    return { success: true }
  } catch (error) {
    console.error("Email sending failed:", error)
    console.error("Error details:", {
      code: error.code,
      command: error.command,
      response: error.response
    })
    return { success: false, error: error.message }
  }
}

// Send admin notification for new alumni approval
const sendAdminApprovalEmail = async (adminEmail, alumni) => {
  const transporter = createTransporter()
  const subject = "New Alumni Registration Pending Approval"
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Alumni Registration Request</h2>
      <p>A new alumni has registered and is awaiting your approval:</p>
      <ul>
        <li><strong>Name:</strong> ${alumni.name}</li>
        <li><strong>Email:</strong> ${alumni.email}</li>
        <li><strong>Batch:</strong> ${alumni.batch}</li>
        <li><strong>Branch:</strong> ${alumni.branch}</li>
        <li><strong>Location:</strong> ${alumni.location}</li>
      </ul>
      <p>Please log in to the admin dashboard to approve or reject this request.</p>
    </div>
  `
  const mailOptions = {
    from: `Alumni Platform <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject,
    html,
  }
  try {
    const result = await transporter.sendMail(mailOptions)
    console.log('Admin approval email sent:', result.messageId)
    return { success: true }
  } catch (error) {
    console.error("Admin approval email failed:", error)
    return { success: false, error: error.message }
  }
}

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendAdminApprovalEmail,
}
