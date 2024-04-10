import React, { useState, useRef, useEffect } from 'react';
import logoImg from '../Images/logo.jpeg';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useIndex } from './IndexContext';
function OTP() {
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [otp, setOTP] = useState('');
  const [phone, setPhone] = useState('');
  const inputRefs = useRef([]);
  const { state } = useLocation();
  const navigate = useNavigate();
  const username = state && state.username;
  const { updateUsername } = useIndex();
  const sendotp = async () => {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    console.log(username);
    const raw = JSON.stringify({
      username: username,
    });
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
    };
    const response = await fetch('http://localhost:3001/sendotp', requestOptions);
    const result = await response.json();
    console.log(result);
    setOTP(result.otp);
  };
  useEffect(() => {
    sendotp();
  }, [username]);
  const navigateToDashboard = (state) => {
    navigate('/app', state);
  };
  const registerjwt = async () => {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    const raw = JSON.stringify({
      username: username,
    });

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      credentials: 'include',
      withCredentials: true,
      body: raw,
    };

    const response = await fetch('http://localhost:3001/registerjwttoken', requestOptions);
    await response.json();
    updateUsername(username);
    navigateToDashboard({ state: { username } });
  };
  const verifyCode = async () => {
    const enteredCode = otpValues.join('');
    console.log(enteredCode);
    console.log(otp);
    if (enteredCode === otp) {
      await registerjwt();
    } else {
      navigate('/auth');
    }
  };

  const handleInputChange = (index, value) => {
    // Allow only the first character
    const truncatedValue = value.slice(0, 1);

    const newOtpValues = [...otpValues];
    newOtpValues[index] = truncatedValue;
    setOtpValues(newOtpValues);

    // Move to the next input box if a digit is entered
    if (truncatedValue && index < otpValues.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  return (
    <div className='flex w-screen h-screen bg-stone-50 justify-center items-center'>
      <div className='w-1/3 h-2/3 bg-orange-50 border-2 border-orange-300 flex flex-col justify-center items-center rounded-lg'>
        <img src={logoImg} className='h-1/3 w-1/3 pb-10 rounded-full' alt='Image Description' />
        <div className='text-lg p-2 pb-10'>Enter OTP Sent To Your Phone Number!</div>
        <div className='flex flex-row pb-10'>
          {otpValues.map((value, index) => (
            <input
              key={index}
              type='text'
              className='text-xl text-center w-14 h-14 mr-2 border-cyan-600 border-2 outline-none'
              value={value}
              onChange={(e) => handleInputChange(index, e.target.value)}
              ref={(ref) => (inputRefs.current[index] = ref)}
              maxLength={1} // Set maximum length to 1
            />
          ))}
        </div>
        <button
          onClick={async () => {
            await verifyCode();
          }}
          className='h-12 w-1/2 bg-cyan-900 border-2 border-sky-300 text-stone-50 text-lg mb-6 placeholder-white rounded-xl hover:bg-cyan-600 hover:text-stone-50 font-semibold hover:font-semibold'
        >
          Verify
        </button>
      </div>
    </div>
  );
}

export default OTP;
