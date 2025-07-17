import { useState } from 'react';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import app from '../firebaseConfig';

const auth = getAuth(app);

export default function Login() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  const sendOTP = async () => {
    window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
      size: 'invisible',
    }, auth);

    const appVerifier = window.recaptchaVerifier;
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmation(confirmationResult);
      alert("OTP sent!");
    } catch (error) {
      console.error(error);
      alert("Error sending OTP");
    }
  };

  const verifyOTP = async () => {
    try {
      await confirmation.confirm(otp);
      alert("Logged in successfully!");
    } catch (error) {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="p-4">
      <input type="tel" placeholder="+91XXXXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} />
      <button onClick={sendOTP}>Send OTP</button>
      <input type="text" placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} />
      <button onClick={verifyOTP}>Verify</button>
      <div id="recaptcha-container"></div>
    </div>
  );
}
