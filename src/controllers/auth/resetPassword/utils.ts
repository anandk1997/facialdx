export const otpCache = new Map<string, { otp: string; timestamp: number }>();
export const OTP_EXPIRATION_TIME_MS = 5 * 60 * 1000; // 5 minutes

export const generateOTP = () => {
  const otpLength = 6;
  const digits = "0123456789";

  let otp = "";

  for (let i = 0; i < otpLength; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }

  return otp;
};

export const otpEmail = Object.freeze({
  subject: "Your OTP for Verification",

  html: (otp: string) => `
    <main>
      <div
        style="
          margin: 0;
          background: #ffffff;
          border-radius: 30px;
          text-align: center;
        "
      >
        <div style="width: 100%; max-width: 489px; margin: 0 auto">
          <h1><span style="color: #218bec">FACIAL</span>DX</h1>

          <img src="cid:otp" style="max-width: 489px" alt="FACIALDX" />

          <img src="cid:credentials" style="display: none" alt="" />

          <h2
            style="
              margin-top: 20px;
              font-size: 24px;
              font-weight: 600;
              color: #1f1f1f;
            "
          >
            OTP for password reset
          </h2>
          <p style="font-size: 16px; font-weight: 500">Dear User,</p>

          <p style="font-weight: 500; letter-spacing: 0.56px">
            Your OTP for password reset is:
          </p>

          <h2
            style="margin: 0; font-size: 24px; font-weight: 600; color: #1f1f1f"
          >
            ${otp}
          </h2>

          <p style="font-size: 16px; font-weight: 500; margin-top: 25px">
            This OTP is valid for 5 minutes. Please use it to verify your
            identity and proceed with the password reset.
          </p>

          <p style="font-size: 16px; font-weight: 500; margin-top: 25px">
            If you did not request this OTP, please ignore this email.
          </p>

          <p
            style="
              font-size: 16px;
              font-weight: 500;
              margin-top: 25px;
              margin-bottom: 2px;
            "
          >
            Thank you,
          </p>

          <p style="font-size: 16px; font-weight: 500; margin-top: 0">
            FacialDX Team
          </p>
        </div>
      </div>
    </main>
`,
});

export const cleanExpiredOTPs = () => {
  const now = Date.now();

  for (const [email, otpData] of otpCache.entries()) {
    if (now - otpData.timestamp > OTP_EXPIRATION_TIME_MS) {
      otpCache.delete(email);
    }
  }
};
