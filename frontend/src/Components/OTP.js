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
    // Allow only numeric characters
    //  const sanitizedValue = value.replace(/\D/g, '');

    //  // Update the OTP value at the specified index
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value; // Only take the first character
    setOtpValues(newOtpValues);

    // Move to the next input box if a digit is entered
    if (value && index < otpValues.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  return (
    // <div className='flex w-screen h-screen bg-stone-50 justify-center items-center'>
    //   <div className='w-1/3 h-2/3 bg-orange-50 border-2 border-orange-300 flex flex-col justify-center items-center rounded-lg'>
    //     <img src={logoImg} className='h-1/3 w-1/3 pb-10 rounded-full' alt='Image Description' />
    //     <div className='text-lg p-2 pb-10'>Enter OTP Sent To Your Phone Number!</div>
    //     <div className='flex flex-row pb-10'>
    //       {otpValues.map((value, index) => (
    //         <input
    //           key={index}
    //           type='text'
    //           className='text-xl text-center w-14 h-14 mr-2 border-cyan-600 border-2 outline-none'
    //           value={value}
    //           onChange={(e) => handleInputChange(index, e.target.value)}
    //           ref={(ref) => (inputRefs.current[index] = ref)}
    //           maxLength={1} // Set maximum length to 1
    //         />
    //       ))}
    //     </div>
    //     <button
    //       onClick={async () => {
    //         await verifyCode();
    //       }}
    //       className='h-12 w-1/2 bg-cyan-900 border-2 border-sky-300 text-stone-50 text-lg mb-6 placeholder-white rounded-xl hover:bg-cyan-600 hover:text-stone-50 font-semibold hover:font-semibold'
    //     >
    //       Verify
    //     </button>
    //   </div>
    // </div>
    <div className='flex justify-center items-center h-screen bg-[#f3f4f6]'>
      <div className='bg-white p- rounded-lg shadow-2xl h-[500px] w-[460px]'>
        <div className='flex flex-col items-center space-y-1.5 p-20'>
          <h3 className='whitespace-nowrap font-semibold tracking-tight text-3xl'>
            Enter 6-digit OTP
          </h3>
          <p className='text-md '>An OTP has been sent to your email</p>
        </div>
        <div className='flex grid items-center gap-4 p-6 justify-center'>
          <noscript></noscript>
          <div
            data-input-otp-container='true'
            className='flex items-center gap-2'
            style={{
              position: 'relative',
              cursor: 'text',
              // userSelect: 'none',
              // pointerEvents: 'none',
              '--root-height': '40px',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '0px calc(-40px) 0px 100%',
                // pointerEvents: 'none',
                // userSelect: 'none',
                background: 'transparent',
              }}
            ></div>
            <div className='flex items-center'>
              {otpValues.map((value, index) => (
                <input
                  key={index}
                  type='text'
                  className='relative text-center focus:outline-none text-black flex border-2 border-gray-300 h-16 w-16 items-center justify-center border-y border-r border-input text-3xl font-extralight transition-all first:rounded-l-md first:border-l last:rounded-r-md'
                  value={otpValues[index]}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  maxLength={1}
                />
              ))}
            </div>
          </div>
          <button
            className='inline-flex bg-black text-white items-center justify-center whitespace-nowrap text-sm mt-8 font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md px-8'
            onClick={verifyCode}
          >
            Verify OTP
          </button>
        </div>
      </div>
    </div>
  );
}

export default OTP;
