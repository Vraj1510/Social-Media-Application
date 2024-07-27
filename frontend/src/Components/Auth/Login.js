import React, { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleImageClick = () => {
    setShowPassword(!showPassword);
  };

  const navigateToDashboard = (state) => {
    navigate('/app', state);
  };

  const navigateToOTP = (state) => {
    navigate('/auth/otp', state);
  };

  const check = async (values) => {
    console.log(values);
    try {
      const response = await fetch('http://localhost:3001/handlelogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
        credentials: 'include',
      });
      console.log('Reaching here');
      console.log(response);
      if (response.ok) {
        toast.success('Login successful!');
        return true; // Login successful
      } else {
        const errorData = await response.json();
        toast.error('User does not exist or invalid credentials');
        console.error(errorData.error);
        return false; // Login failed
      }
    } catch (err) {
      console.log('Reaching here');
      toast.error('Error during login: ' + err.message);
      console.error('Error during login:', err.message);
      return false; // Login failed
    }
  };

  useEffect(() => {
    const disableBackButton = (event) => {
      event.preventDefault();
      return false;
    };

    // Disable the back button
    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener('popstate', disableBackButton);

    return () => {
      // Re-enable the back button when the component unmounts
      window.removeEventListener('popstate', disableBackButton);
    };
  }, []);

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

        const result = await response.json();
        if (result.valid === true) {
          navigateToDashboard({ state: { username: result.username } });
        }
      } catch (err) {
        console.log('Error during session check:', err.message);
      }
    };
    checkSession();
  }, []);

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .matches(
          /^[a-zA-Z0-9._]{1,30}$/,
          'Username must be alphanumeric and may include underscores and periods, but not at the beginning or end.',
        )
        .required('Username is required'),
      password: Yup.string()
        .matches(
          /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/,
          'Password must contain at least 8 characters, 1 capital letter, 1 small letter, 1 special character, and 1 digit',
        )
        .required('Password is required'),
    }),
    onSubmit: async (values) => {
      const loginSuccess = await check(values);
      if (loginSuccess) {
        navigateToOTP({ state: { username: values.username } });
      }
    },
  });

  return (
    <div className='select-none flex justify-center items-center h-screen bg-[#f3f4f6]'>
      <ToastContainer />
      <div className='bg-white p-10 flex flex-col justify-around rounded-lg shadow-2xl h-[600px] w-[460px]'>
        <div className='flex flex-col items-center mb-4'>
          <div className='bg-[#3b82f6] text-white p-2 rounded-full'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='h-16 w-16'
            >
              <path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'></path>
              <path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'></path>
            </svg>
          </div>
          <h2 className='text-3xl font-semibold mt-1 mb-5'>Connecta</h2>
        </div>
        <form className='flex flex-col space-y-4' onSubmit={formik.handleSubmit}>
          <div className='flex flex-col space-y-0.5'>
            <input
              className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-md ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
              placeholder='Username'
              type='text'
              {...formik.getFieldProps('username')}
            />
            {formik.touched.username && formik.errors.username ? (
              <div className='text-red-500 text-sm ml-1'>{formik.errors.username}</div>
            ) : null}
          </div>
          <div className='flex flex-col space-y-0.5 pb-5'>
            <div className='relative'>
              <input
                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-md ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                placeholder='Password'
                type={showPassword ? 'text' : 'password'}
                {...formik.getFieldProps('password')}
              />
              {showPassword ? (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='absolute inset-y-0 right-0 mr-3 my-auto h-5 w-5 text-gray-500'
                  onClick={handleImageClick}
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
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='absolute inset-y-0 right-0 mr-3 my-auto h-5 w-5 text-gray-500'
                  onClick={handleImageClick}
                >
                  <path d='M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z'></path>
                  <circle cx='12' cy='12' r='3'></circle>
                  <path d='M6 6l12 12' stroke='currentColor' strokeWidth='2'></path>
                </svg>
              )}
            </div>
            {formik.touched.password && formik.errors.password ? (
              <div className='text-red-500 text-sm ml-1'>{formik.errors.password}</div>
            ) : null}
          </div>
          <button
            type='submit'
            className='inline-flex items-center justify-center whitespace-nowrap rounded-md text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full bg-black text-white'
          >
            Login
          </button>
          <div className='flex items-center justify-center'>
            <span className='bg-white px-2 -mt-1 text-md text-gray-500'>OR</span>
          </div>
          <div className='flex items-center justify-center'>
            <a
              className='text-md text-center -mt-3 text-blue-600 hover:underline'
              href='/auth/forgotpassword'
            >
              Forgot Your Password?
            </a>
          </div>
        </form>

        <div className='text-center'>
          <span className='text-md text-gray-500'>Create An Account?</span>
          <a
            onClick={() => navigate('/auth/signup')}
            className='text-md text-blue-600 hover:underline'
            href='#'
          >
            {' '}
            Register
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
