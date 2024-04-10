// ProfileForm.js
import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import FormData from './FormValues.js';
import { useState } from 'react';
import details1 from '../Images/phone.png';
const Form = ({ onSubmit }) => {
  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    middleName: Yup.string().required('Middle Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    mail: Yup.string().required('Email is required').email('Invalid email address'),
    address1: Yup.string().required('Address 1 is required'),
    address2: Yup.string().required('Address 2 is required'),
    address3: Yup.string().required('Address 3 is required'),
  });
  const [openform, setopenform] = useState(false);
  const handleForm = () => {
    setopenform(!openform);
  };

  const formik = useFormik({
    initialValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      mail: '',
      address1: '',
      address2: '',
      address3: '',
    },
    validationSchema,
    onSubmit,
  });
  return (
    <div>
      <img
        src={details1}
        onClick={handleForm}
        className='h-[3.5rem] pl-2 pr-1 w-20 pb-1 mt-20 hover:bg-stone-50'
      ></img>
      {openform && (
        <div className='fixed inset-0 flex justify-center items-center z-50 backdrop-filter backdrop-blur-sm bg-black bg-opacity-50'>
          <div className='flex flex-col bg-cyan-950 p-3 w-[71rem] h-[49rem] rounded-lg z-50'>
            <form onSubmit={formik.handleSubmit} className='flex flex-col'>
              <input
                type='text'
                name='firstName'
                placeholder='First Name'
                className='m-3 p-2 text-lgrounded-md h-[2.5rem]'
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                onFocus={formik.handleBlur}
                value={formik.values.firstName}
              ></input>
              {formik.touched.firstName && formik.errors.firstName && (
                <div className='error text-white -mt-2 ml-4'>{formik.errors.firstName}</div>
              )}
              <input
                type='text'
                name='middleName'
                placeholder='Middle Name'
                className='m-3 p-2 text-lg rounded-md h-[2.5rem]'
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                onFocus={formik.handleBlur}
                value={formik.values.middleName}
              ></input>
              {formik.touched.middleName && formik.errors.middleName && (
                <div className='error text-white -mt-2 ml-4'>{formik.errors.middleName}</div>
              )}
              <input
                type='text'
                name='lastName'
                placeholder='Last Name'
                className='m-3 p-2 text-lg rounded-md h-[2.5rem]'
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                onFocus={formik.handleBlur}
                value={formik.values.lastName}
              ></input>
              {formik.touched.lastName && formik.errors.lastName && (
                <div className='error text-white -mt-2 ml-4'>{formik.errors.lastName}</div>
              )}
              <input
                type='text'
                name='mail'
                placeholder='Mail'
                className='m-3 p-2 text-lg rounded-md h-[2.5rem]'
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                onFocus={formik.handleBlur}
                value={formik.values.mail}
              ></input>
              {formik.touched.mail && formik.errors.mail && (
                <div className='error text-white -mt-2 ml-4'>{formik.errors.mail}</div>
              )}
              <input
                type='text'
                name='address1'
                placeholder='Address 1'
                className='m-3 p-2 text-lg rounded-md h-[2.5rem]'
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                onFocus={formik.handleBlur}
                value={formik.values.address1}
              ></input>
              {formik.touched.address1 && formik.errors.address1 && (
                <div className='error text-white -mt-2 ml-4'>{formik.errors.address1}</div>
              )}
              <input
                type='text'
                name='address2'
                placeholder='Address 2'
                className='m-3 p-2 text-lg rounded-md h-[2.5rem]'
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                onFocus={formik.handleBlur}
                value={formik.values.address2}
              ></input>
              {formik.touched.address2 && formik.errors.address2 && (
                <div className='error text-white -mt-2 ml-4'>{formik.errors.address2}</div>
              )}
              <input
                type='text'
                name='address3'
                placeholder='Address 3'
                className='m-3 p-2 text-lg rounded-md h-[2.5rem]'
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                onFocus={formik.handleBlur}
                value={formik.values.address3}
              ></input>
              {formik.touched.address3 && formik.errors.address3 && (
                <div className='error text-white -mt-2 ml-4'>{formik.errors.address3}</div>
              )}
              <div className='flex flex-row justify-between'>
                <FormData.Countries></FormData.Countries>
                <FormData.Dob className='m-1'></FormData.Dob>
              </div>
              {/* age */}
              <div className='flex flex-row mt-10'>
                <button
                  onClick={handleForm}
                  className='bg-stone-50 h-12 w-1/6 m-3 hover:text-white text-cyan-950 hover:bg-cyan-600 px-2 py-1 mt-3 rounded-md'
                >
                  Close
                </button>
                <button className='bg-stone-50 h-12 w-1/6 m-3 hover:text-white text-cyan-950 hover:bg-cyan-600 px-2 py-1 mt-3 rounded-md'>
                  Edit
                </button>
                <button
                  type='submit'
                  className='bg-stone-50 h-12 w-1/6 m-3 hover:text-white text-cyan-950 hover:bg-cyan-600 px-2 py-1 mt-3 rounded-md'
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Form;
