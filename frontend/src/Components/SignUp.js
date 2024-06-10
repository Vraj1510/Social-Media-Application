import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIndex } from './IndexContext';
function SignUp() {
  const [username, setUsername1] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { setUsername } = useIndex();
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
  const Input = async () => {
    // e.preventDefault();
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
      await registerjwt();
      navigateToDashboard({ state: { username } });
      // }
    }
  };

  return (
    <div class='select-none flex justify-center items-center h-screen bg-[#f3f4f6]'>
      <div class='bg-white p-10 rounded-lg shadow-2xl h-[500px] w-[460px]'>
        <div class='flex flex-col items-center mb-4'>
          <div class='bg-[#3b82f6] text-white p-2 rounded-full'>
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
              class='h-16 w-16'
            >
              <path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'></path>
              <path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'></path>
            </svg>
          </div>
          <h2 class='text-3xl font-semibold mt-1 mb-5'>Connecta</h2>
        </div>
        <form class='flex flex-col space-y-4'>
          <input
            class='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-md ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
            placeholder='Username'
            type='text'
            name={username}
            value={username}
            onChange={(e) => {
              setUsername1(e.target.value);
            }}
          />
          <div class='relative'>
            <input
              class='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-md ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
              placeholder='Password'
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
          <input
            class='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-md ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
            placeholder='Email'
            type='text'
            name={email}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
          <button
            onClick={() => {
              handleSignUp();
            }}
            class='inline-flex items-center justify-center whitespace-nowrap rounded-md text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full bg-black text-white'
          >
            Register
          </button>
        </form>
        <div class='mt-8 text-center'>
          <span class='text-md text-gray-500'>Already Have An Account?</span>
          <a
            onClick={() => {
              navigate('/auth');
            }}
            class='text-md text-blue-600 hover:underline'
            href='#'
          >
            {' '}
            Login
          </a>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
