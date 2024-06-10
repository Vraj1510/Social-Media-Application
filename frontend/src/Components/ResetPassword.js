import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import visible from '../Images/visible.png';
import hidden from '../Images/hidden.png';
import { useState } from 'react';
import { useIndex } from './IndexContext';
const ResetPassword = () => {
  const { id, token } = useParams();
  console.log(id);
  console.log(token);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { updateResetPassword } = useIndex();
  const navigate = useNavigate();
  const setNewPassword = async () => {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    const raw = JSON.stringify({
      username: id,
      password: password,
    });

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    const response = await fetch('http://localhost:3001/resetpassword', requestOptions);
    await response.json();
    navigate('/auth');
    updateResetPassword(true);
  };

  return (
    // <div className='flex flex-col w-screen h-screen bg-stone-50 justify-center items-center'>
    //   <div className='w-3/4 h-3/6 sm:w-4/5 md:w-3/5 py-4 lg:w-2/5 border-2 border-orange-300 shadow-lg bg-orange-50 flex flex-col justify-center items-center rounded-lg'>
    //     <div className='w-full items-center flex flex-col justify-center'>
    //       {' '}
    //       {/* Changed from flex-col to flex */}
    //       <div className='w-full text-4xl mb-10 text-center font-normal text-cyan-900'>
    //         Reset Password
    //       </div>
    //       <div className='flex flex-row w-2/3 rounded-lg shadow-sm mb-4 h-12 border-[2.3px] border-sky-300  mt-0.5 text-stone-950 text-lg  bg-stone-50 placeholder-stone-700 outline-none !important cursor-pointer '>
    //         <input
    //           className='w-full h-full p-2 placeholder-stone-700 outline-none !important cursor-pointer'
    //           type={showPassword ? 'text' : 'password'}
    //           placeholder='Password....'
    //           value={password}
    //           onChange={(e) => setPassword(e.target.value)}
    //           required
    //         />
    //         <img
    //           onClick={handleImageClick}
    //           src={showPassword ? visible : hidden}
    //           className='bg-cyan-950 p-2 h-11.5 w-11 '
    //         ></img>
    //       </div>
    //       <div className='flex flex-row w-2/3 rounded-lg shadow-sm mb-10 h-12 border-[2.3px] border-sky-300  mt-0.5 text-stone-950 text-lg  bg-stone-50 placeholder-stone-700 outline-none !important cursor-pointer '>
    //         <input
    //           className='w-full h-full p-2 placeholder-stone-700 outline-none !important cursor-pointer'
    //           type={showPassword ? 'text' : 'password'}
    //           placeholder='Confirm Password....'
    //           value={passwordConfirm}
    //           onChange={(e) => setPasswordConfirm(e.target.value)}
    //           required
    //         />
    //         <img
    //           onClick={handleImageClick1}
    //           src={showPassword1 ? visible : hidden}
    //           className='bg-cyan-950 p-2 h-11.5 w-11'
    //         ></img>
    //       </div>
    //     </div>
    //     <button
    //       onClick={async () => {
    //         await setNewPassword();
    //       }}
    //       className={`h-14  w-2/5 text-white border-2 border-sky-300 text-xl bg-cyan-950 placeholder-white rounded-xl hover:bg-cyan-700  font-normal hover:font-semibold`}
    //     >
    //       Change Password
    //     </button>
    //   </div>
    // </div>
    <div class='flex justify-center items-center h-screen bg-[#f3f4f6]'>
      <div
        class='rounded-lg border bg-white text-card-foreground shadow-2xl w-[460px] h-[500px] max-w-md mx-auto'
        data-v0-t='card'
      >
        {' '}
        <div class='flex flex-col p-6 pt-14 space-y-1 items-center'>
          <h3 class='whitespace-nowrap tracking-tight text-3xl font-bold'>Reset Password</h3>
          <p class='text-md text-muted-foreground'>Enter your new password below</p>
        </div>
        <div class='p-6 items-center'>
          <div class=''>
            <div class='space-y-1 mt-4'>
              <label
                class='text-md font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                for='password'
              >
                Enter Password
              </label>
              <div className='flex relative'>
                <input
                  class='flex h-10 text-md w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                  id='password'
                  required=''
                  type={showPassword ? 'text' : 'password'}
                  name={password}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />
                {showPassword ? (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    stroke-width='2'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    class='absolute inset-y-0 right-0 mr-3 my-auto h-5 w-5 text-gray-500'
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                  >
                    <path d='M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z'></path>
                    <circle cx='12' cy='12' r='3'></circle>
                  </svg>
                ) : (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    stroke-width='2'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    class='absolute inset-y-0 right-0 mr-3 my-auto h-5 w-5 text-gray-500'
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                  >
                    <path d='M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z'></path>
                    <circle cx='12' cy='12' r='3'></circle>
                    <path d='M6 6l12 12' stroke='currentColor' stroke-width='2'></path>
                  </svg>
                )}
              </div>
            </div>
            <div class='space-y-1 mt-4'>
              <label
                class='text-md font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                for='confirm'
              >
                Confirm Password
              </label>
              <div className='flex relative'>
                <input
                  class='flex h-10 text-md w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                  id='password'
                  required=''
                  type={showConfirmPassword ? 'text' : 'password'}
                  name={passwordConfirm}
                  value={passwordConfirm}
                  onChange={(e) => {
                    setPasswordConfirm(e.target.value);
                  }}
                />
                {showConfirmPassword ? (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    stroke-width='2'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    class='absolute inset-y-0 right-0 mr-3 my-auto h-5 w-5 text-gray-500'
                    onClick={() => {
                      setShowConfirmPassword(!showConfirmPassword);
                    }}
                  >
                    <path d='M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z'></path>
                    <circle cx='12' cy='12' r='3'></circle>
                  </svg>
                ) : (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    stroke-width='2'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    class='absolute inset-y-0 right-0 mr-3 my-auto h-5 w-5 text-gray-500'
                    onClick={() => {
                      setShowConfirmPassword(!showConfirmPassword);
                    }}
                  >
                    <path d='M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z'></path>
                    <circle cx='12' cy='12' r='3'></circle>
                    <path d='M6 6l12 12' stroke='currentColor' stroke-width='2'></path>
                  </svg>
                )}
              </div>
            </div>
            <button
              onClick={async () => {
                await setNewPassword();
              }}
              class='inline-flex mt-16 bg-black text-white items-center justify-center whitespace-nowrap rounded-md text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full'
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
