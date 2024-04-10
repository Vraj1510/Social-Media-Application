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
  const { updateResetPassword } = useIndex();
  const handleImageClick = () => {
    setShowPassword(!showPassword);
  };
  const [showPassword1, setShowPassword1] = useState(false);
  const handleImageClick1 = () => {
    setShowPassword1(!showPassword1);
  };
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
    <div className='flex flex-col w-screen h-screen bg-stone-50 justify-center items-center'>
      <div className='w-3/4 h-3/6 sm:w-4/5 md:w-3/5 py-4 lg:w-2/5 border-2 border-orange-300 shadow-lg bg-orange-50 flex flex-col justify-center items-center rounded-lg'>
        <div className='w-full items-center flex flex-col justify-center'>
          {' '}
          {/* Changed from flex-col to flex */}
          <div className='w-full text-4xl mb-10 text-center font-normal text-cyan-900'>
            Reset Password
          </div>
          <div className='flex flex-row w-2/3 rounded-lg shadow-sm mb-4 h-12 border-[2.3px] border-sky-300  mt-0.5 text-stone-950 text-lg  bg-stone-50 placeholder-stone-700 outline-none !important cursor-pointer '>
            <input
              className='w-full h-full p-2 placeholder-stone-700 outline-none !important cursor-pointer'
              type={showPassword ? 'text' : 'password'}
              placeholder='Password....'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <img
              onClick={handleImageClick}
              src={showPassword ? visible : hidden}
              className='bg-cyan-950 p-2 h-11.5 w-11 '
            ></img>
          </div>
          <div className='flex flex-row w-2/3 rounded-lg shadow-sm mb-10 h-12 border-[2.3px] border-sky-300  mt-0.5 text-stone-950 text-lg  bg-stone-50 placeholder-stone-700 outline-none !important cursor-pointer '>
            <input
              className='w-full h-full p-2 placeholder-stone-700 outline-none !important cursor-pointer'
              type={showPassword ? 'text' : 'password'}
              placeholder='Confirm Password....'
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
            />
            <img
              onClick={handleImageClick1}
              src={showPassword1 ? visible : hidden}
              className='bg-cyan-950 p-2 h-11.5 w-11'
            ></img>
          </div>
        </div>
        <button
          onClick={async () => {
            await setNewPassword();
          }}
          className={`h-14  w-2/5 text-white border-2 border-sky-300 text-xl bg-cyan-950 placeholder-white rounded-xl hover:bg-cyan-700  font-normal hover:font-semibold`}
        >
          Change Password
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
