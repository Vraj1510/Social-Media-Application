import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import visible from '../Images/visible.png';
import hidden from '../Images/hidden.png';
import logoImg from '../Images/logo.jpeg';
import { useNavigate } from 'react-router-dom';
import { useIndex } from './IndexContext';
function SignUp() {
  const [username, setUsername1] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { setUsername } = useIndex();
  const handleImageClick = () => {
    setShowPassword(!showPassword);
  };
  var bool1 = true;
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
    navigateToDashboard({ state: { username } });
  };
  const checkUser = async () => {
    try {
      const response = await fetch('http://localhost:3001/checkUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
        }),
      });
      console.log(response);
      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData.message);
        navigateToDashboard({ state: { username } });
      } else {
        const errorData = await response.json();
        console.error(errorData.error);
        alert('User Already Exists');
      }
    } catch (err) {
      console.error('Error during login:', err.message);
    }
  };
  const Input = async (e) => {
    e.preventDefault();
    try {
      const body = { username, password, email };
      const response = await fetch('http://localhost:3001/insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        console.error('API request failed with status:', response.status);
        return;
      }
      const responseData = await response.json();
      if (responseData.success) {
        console.log('User created successfully');
      } else {
        console.error('User creation failed:', responseData.message);
      }
    } catch (err) {
      console.error(err.message);
    }
  };
  const navigate = useNavigate();
  const navigateToDashboard = (state) => {
    setUsername(username);
    navigate('/app', state);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (username.trim() === '') {
      alert('Please fill in username.');
    } else if (password.trim() === '') {
      alert('Please fill in password.');
    } else if (email.trim() === '') {
      alert('Please fill in email.');
    } else if (!password.match('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$')) {
      alert(
        'The password must contain at least 8 characters, 1 capital alphabet, 1 small alphabet, 1 special character, and 1 digit',
      );
    } else {
      await checkUser();
      await Input(e);
      // navigateToDashboard({ state: { username } });
      // }
    }
  };

  return (
    <div className='flex flex-col w-screen h-screen bg-stone-50 justify-center items-center'>
      <div className='w-3/4 h-3/4 sm:w-3/5 md:w-2/5 lg:w-1/3 sm:h-3/4 lg:h-2/3 border-2 border-orange-300 shadow-lg bg-orange-50 flex flex-col justify-center items-center rounded-lg'>
        <img src={logoImg} className='h-1/3 w-1/3 pb-10 rounded-full' alt='Image Description' />
        <input
          className='mb-4 w-2/3 shadow-sm h-12 border-2 border-sky-300  mt-0.5 text-stone-950 text-lg  bg-stone-50 placeholder-stone-700 outline-none !important cursor-pointer p-2'
          type='text'
          placeholder='Username....'
          value={username}
          onChange={(e) => setUsername1(e.target.value)}
          required
        />
        <div className='flex flex-row w-2/3 shadow-sm mb-4 h-12 border-2 border-sky-300  mt-0.5 text-stone-950 text-lg  bg-stone-50 placeholder-stone-700 outline-none !important cursor-pointer '>
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
        <input
          className='mb-8 w-2/3 shadow-sm h-12 border-2 border-sky-300  mt-0.5 text-stone-950 text-lg  bg-stone-50 placeholder-stone-700 outline-none !important cursor-pointer p-2'
          type='text'
          placeholder='Email....'
          value={username}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          onClick={handleSignUp}
          className='h-11 w-1/3 text-stone-50 border-2 border-sky-300 text-lg bg-cyan-950 placeholder-white rounded-xl hover:bg-cyan-600 hover:text-stone-50 font-semibold hover:font-semibold'
        >
          Register
        </button>
      </div>
      <div className='w-3/4 sm:w-3/5 md:w-2/5 lg:w-1/3 mt-1.5 border-2 border-orange-300 shadow-lg bg-orange-50 flex flex-col justify-center items-center rounded-lg'>
        <p className='text-left py-2 font-normal text-xl'>
          Already Have An Account?{' '}
          <Link
            to='/auth'
            className='text-cyan-800 text-xl font-medium hover:underline hover:underline-offset-2'
          >
            Login
          </Link>
        </p>
      </div>{' '}
    </div>
  );
}

export default SignUp;
