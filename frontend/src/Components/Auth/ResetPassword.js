import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useIndex } from '../IndexContext/IndexContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const ResetPassword = () => {
  const { id, token } = useParams();
  const { updateResetPassword } = useIndex();
  const navigate = useNavigate();

  const validationSchema = Yup.object().shape({
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .matches(/[0-9]/, 'Password must contain at least one digit')
      .matches(/[@$!%*?&]/, 'Password must contain at least one special character')
      .required('Password is required'),
    passwordConfirm: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required'),
  });

  const setNewPassword = async (values) => {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    const raw = JSON.stringify({
      username: id,
      password: values.password,
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
    <div className='flex justify-center items-center h-screen bg-[#f3f4f6]'>
      <div
        className='rounded-lg border bg-white text-card-foreground shadow-2xl w-[460px] h-[500px] max-w-md mx-auto'
        data-v0-t='card'
      >
        <div className='flex flex-col p-6 pt-14 space-y-1 items-center'>
          <h3 className='whitespace-nowrap tracking-tight text-3xl font-bold'>Reset Password</h3>
          <p className='text-md text-muted-foreground'>Enter your new password below</p>
        </div>
        <div className='p-6 items-center'>
          <Formik
            initialValues={{ password: '', passwordConfirm: '' }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
              await setNewPassword(values);
            }}
          >
            {({ values, handleChange, handleBlur, isSubmitting }) => (
              <Form>
                <div className='space-y-1 mt-4'>
                  <label
                    className='text-md font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                    htmlFor='password'
                  >
                    Enter Password
                  </label>
                  <div className='flex relative'>
                    <Field
                      className='flex h-10 text-md w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                      id='password'
                      name='password'
                      type='password'
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <ErrorMessage
                      name='password'
                      component='div'
                      className='text-red-500 text-xs'
                    />
                  </div>
                </div>
                <div className='space-y-1 mt-4'>
                  <label
                    className='text-md font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                    htmlFor='passwordConfirm'
                  >
                    Confirm Password
                  </label>
                  <div className='flex relative'>
                    <Field
                      className='flex h-10 text-md w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                      id='passwordConfirm'
                      name='passwordConfirm'
                      type='password'
                      value={values.passwordConfirm}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <ErrorMessage
                      name='passwordConfirm'
                      component='div'
                      className='text-red-500 text-xs'
                    />
                  </div>
                </div>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='inline-flex mt-16 bg-black text-white items-center justify-center whitespace-nowrap rounded-md text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full'
                >
                  Change Password
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
