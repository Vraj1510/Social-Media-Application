import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import visible from '../Images/visible.png';
import hidden from '../Images/hidden.png';
import logoImg from '../Images/logo.jpeg';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const handleImageClick = () => {
    setShowPassword(!showPassword);
  };
  var bool1 = false;
  const navigate = useNavigate();
  const navigateToDashboard = (state) => {
    navigate('/app', state);
  };
  const navigateToOTP = (state) => {
    navigate('/auth/otp', state);
  };
  const check = async () => {
    try {
      const response = await fetch('http://localhost:3001/handlelogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        withCredentials: true,
        body: JSON.stringify({
          username,
          password,
        }),
      });
      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData.message);
        navigateToOTP({ state: { username } });
      } else {
        const errorData = await response.json();
        console.error(errorData.error);
        alert('User does not exist or invalid credentials');
      }
    } catch (err) {
      console.error('Error during login:', err.message);
    }
  };

  // useEffect(() => {
  //   const disableBackButton = (event) => {
  //     event.preventDefault();
  //     return false;
  //   };

  //   // Disable the back button
  //   window.history.pushState(null, null, window.location.pathname);
  //   window.addEventListener('popstate', disableBackButton);

  //   return () => {
  //     // Re-enable the back button when the component unmounts
  //     window.removeEventListener('popstate', disableBackButton);
  //   };
  // }, []);

  const handleLogin = async () => {
    if (username.trim() === '') {
      alert('Please fill in username.');
    } else if (password.trim() === '') {
      alert('Please fill in password.');
    } else if (!password.match('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$')) {
      alert(
        'The password must contain atleast 8 characters, 1 capital alphabet, 1 small alphabet, 1 special character and 1 digit',
      );
    } else {
      await check();
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('http://localhost:3001/checksession', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // This line enables sending cookies
        });
        console.log(response);
        const result = await response.json();
        console.log(result);
        if (result.valid === true) {
          navigateToDashboard({ state: { username } });
        } else {
        }
      } catch (err) {
        console.error('Error during session check:', err.message);
      }
    };
    checkSession();
  }, []);

  return (
    <div className='flex flex-col w-screen h-screen bg-stone-50 justify-center items-center'>
      <div className='w-3/4 h-3/4 sm:w-3/5 md:w-2/5 lg:w-1/3 sm:h-3/4 lg:h-2/3 border-2 border-orange-300 shadow-lg bg-orange-50 flex flex-col justify-center items-center rounded-lg'>
        <img src={logoImg} className='h-1/3 w-1/3 pb-10 rounded-full' alt='Image Description' />
        <input
          className='mb-4 w-2/3 shadow-sm h-12 border-2 border-sky-300  mt-0.5 text-stone-950 text-lg  bg-stone-50 placeholder-stone-700 outline-none !important cursor-pointer p-2'
          type='text'
          placeholder='Username....'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <div className='flex flex-row w-2/3 shadow-sm mb-10 h-12 border-2 border-sky-300  mt-0.5 text-stone-950 text-lg  bg-stone-50 placeholder-stone-700 outline-none !important cursor-pointer '>
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
        <button
          onClick={() => {
            handleLogin();
          }}
          className='h-11 w-1/3 text-stone-50 border-2 border-sky-300 text-lg bg-cyan-950 placeholder-white rounded-xl hover:bg-cyan-600 hover:text-stone-50 font-semibold hover:font-semibold'
        >
          Login
        </button>
        <div className='flex flex-row w-2/3 items-center -mt-1 justify-between'>
          <div className='flex-grow h-[1px] bg-gradient-to-r from-transparent to-cyan-950'></div>
          <div className='z-10 text-cyan-950 text-lg p-3'>OR</div>
          <div className='flex-grow h-[1px] bg-gradient-to-r from-cyan-950 to-transparent'></div>
        </div>
        <Link
          to='/auth/forgotpassword'
          className='-mt-2.5 text-sky-900 hover:underline hover:underline-offset-1 cursor-pointer font-normal text-lg'
        >
          Forgot Your Password?
        </Link>
      </div>
      <div className='w-3/4 sm:w-3/5 md:w-2/5 lg:w-1/3 mt-4 border-2 border-orange-300 shadow-lg bg-orange-50 flex flex-col justify-center items-center rounded-lg'>
        <p className='text-left py-2 font-normal text-xl'>
          Create An Account?{' '}
          <button
            onClick={() => {
              navigate('/auth/signup');
            }}
            className='text-cyan-800 text-xl font-medium hover:underline hover:underline-offset-2'
          >
            Register
          </button>
        </p>
      </div>{' '}
    </div>
  );
}

export default Login;
