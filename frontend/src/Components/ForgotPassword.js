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
        body: raw,
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
    <div class='flex justify-center items-center h-screen bg-[#f3f4f6]'>
      <div
        class='rounded-lg border bg-white text-card-foreground shadow-2xl w-[460px] h-400px] max-w-md mx-auto'
        data-v0-t='card'
      >
        <div class='flex flex-col space-y-1.5 p-6 pt-14 pb-10 text-center'>
          <h3 class='whitespace-nowrap tracking-tight text-3xl font-bold'>Forgot Password</h3>
          <p class='text-sm text-muted-foreground'>Enter your email to reset your password</p>
        </div>
        <div class='p-6 mb-10'>
          <div class='space-y-2'>
            <input
              class='flex h-10 text-md w-full mb-6 rounded-md border border-input bg-background px-3 py-2  ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
              id='email'
              placeholder='m@example.com'
              required=''
              type='email'
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
          </div>
          {isButtonDisabled && (
            <div className='flex items-center w-full space-x-2 -mt-2 mb-6 justify-center'>
              <svg
                // {...props}
                xmlns='http://www.w3.org/2000/svg'
                width='18'
                height='18'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='flex items-center space-x-2 text-sm'
              >
                <circle cx='12' cy='12' r='10' />
                <polyline points='12 6 12 12 16 14' />
              </svg>
              <span className='text-sm'>
                You can resend the email after {Math.floor(remainingTime / 60)}:
                {remainingTime % 60 < 10 ? '0' : ''}
                {remainingTime % 60}
              </span>
            </div>
          )}
          <button
            onClick={() => {
              sendmail();
            }}
            disabled={isButtonDisabled}
            class={`inline-flex items-center mb-2 bg-black text-white justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full`}
          >
            Send Email
          </button>
          <button
            onClick={() => {
              navigate('/auth');
            }}
            class={`inline-flex items-center bg-black text-white justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full`}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
