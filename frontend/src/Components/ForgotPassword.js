import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIndex } from './IndexContext';
const ForgotPassword = () => {
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const { resetPassword } = useIndex();
  const sendmail = async () => {
    try {
      setIsButtonDisabled(true);
      setRemainingTime(120); // 3 minutes in seconds
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');

      const raw = JSON.stringify({
        email,
      });
      console.log(email);
      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw
      };

      const response = await fetch('http://localhost:3001/sendemail', requestOptions);
      console.log(response);
      // await response.json();
    } catch (err) {
      console.log(err.message);
    }
  };
  useEffect(() => {
    if (resetPassword) {
      navigate('/404');
    }
  });
  useEffect(() => {
    if (isButtonDisabled) {
      const timer = setTimeout(() => {
        if (remainingTime > 0) {
          setRemainingTime(remainingTime - 1);
        } else {
          setIsButtonDisabled(false);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isButtonDisabled, remainingTime]);

  return (
    <div className='flex flex-col w-screen h-screen bg-stone-50 justify-center items-center'>
      <div className='w-3/4 h-2/5 sm:w-4/5 md:w-3/5 py-8 lg:w-2/5 border-2 border-orange-300 shadow-lg bg-orange-50 flex flex-col justify-center items-center rounded-lg'>
        <div className='text-4xl mb-7 text-center font-normal text-cyan-900'>Forgot Password</div>
        <input
          type='text'
          className='w-2/3 mb-2 border-2 outline-none border-sky-300 h-12 p-2 text-lg placeholder:text-gray-500'
          placeholder='Enter Your Email....'
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        ></input>
        <button
          onClick={() => {
            sendmail();
          }}
          className={`h-10 mt-4 w-2/5 text-white border-2 border-sky-300 text-xl bg-cyan-950 placeholder-white rounded-xl hover:bg-cyan-700  font-normal hover:font-semibold ${
            isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isButtonDisabled}
        >
          Send Email
        </button>
        {isButtonDisabled && (
          <p className='text-md text-gray-900 mt-1'>
            Resend again after {Math.floor(remainingTime / 60)}:{remainingTime % 60 < 10 ? '0' : ''}
            {remainingTime % 60}
          </p>
        )}
        <div className='text-center text-lg px-12 mt-1'>Reset your password now!</div>
        <div className='text-center text-lg px-12 -mt-2'>
          We have sent a link for the same to your email.
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
