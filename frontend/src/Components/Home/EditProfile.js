import React, { useState } from 'react';
import { useEffect } from 'react';
import { useIndex } from '../IndexContext/IndexContext';
import Sidebar from './Sidebar';
import PYMK from './PYMK';
import { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
const EditProfile = () => {
  const { state } = useLocation();
  const [file, setFile] = useState(null);
  const { username } = useIndex();
  const { updateUsername } = useIndex();
  const navigate = useNavigate();
  const [newUsername, setNewUsername] = useState(username);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const { index } = useIndex();
  const [inputValue, setInputValue] = useState('');
  const fileInput = useRef(null);
  const [imageUrl, setImageUrl] = useState('');
  const [changed, setChanged] = useState(false);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const handleImageClick = () => {
    setShowPassword(!showPassword);
  };
  const fetchprofile = async () => {
    try {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');

      const raw = JSON.stringify({
        username,
      });

      const requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      };

      const response = await fetch('http://localhost:3001/fetchprofile', requestOptions);
      const result = await response.json();
      setNewUsername(result.data.user_name);
      setPassword(result.data.password);
      setEmail(result.data.email);
      setInputValue(result.data.note);
      setImageUrl(result.data.profile);
    } catch (err) {
      console.log(err.message);
    }
  };
  useEffect(() => {
    // fetchnote1();
    fetchprofile();
  }, [username]);
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const handleFileChange = (e) => {
    const selectedFile = e.target.files;
    setChanged(true);
    console.log(typeof URL.createObjectURL(selectedFile[0]));
    console.log(URL.createObjectURL(selectedFile[0]));
    setFile(e.target.files[0]);
    setImageUrl(URL.createObjectURL(selectedFile[0]));
  };

  const updateProfile = async () => {
    // if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('username', username);
      formData.append('newUsername', newUsername);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('caption', inputValue);
      console.log('Done');
      const response = await fetch('http://localhost:3001/updateprofile', {
        method: 'POST',
        body: formData,
      });
      await response.json();
      console.log('Updated Successfully');
      // await fetchprofile();
      // navigate('/app/profile');
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth > 768);
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    handleResize(); // Call it once to set initial state based on screen size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [index, isSmallScreen]);

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
        if (result.valid === false) {
          navigate('/auth');
        } else {
          console.log(result.username);
          //  setUsername1(result.username);
          updateUsername(result.username);
        }
      } catch (err) {
        console.error('Error during session check:', err.message);
      }
    };

    checkSession();
  }, []);

  return (
    <div className='md:h-auto lg:h-auto w-screen h-screen'>
      <div
        className={`flex  ${
          isSmallScreen ? 'flex-col flex-col-wrap overflow-y-scroll -mt-1' : 'flex-row'
        } w-screen h-screen justify-start lg:justify-between`}
      >
        {!isSmallScreen && <Sidebar index={1} username={username}></Sidebar>}
        {isSmallScreen && (
          <div className='w-screen h-auto mt-2'>
            {' '}
            <Sidebar index={1} username={username}></Sidebar>
          </div>
        )}
        <div className='flex flex-col h-[97.5%] justify-around items-center lg:w-[45%] w-[72%] mt-2 rounded-md bg-white border shadow-md'>
          <div className='flex flex-row items-center space-x-20'>
            <button
              onClick={() => fileInput.current.click()}
              class='inline-flex bg-gray-100 shadow-md items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 border-input bg-background hover:bg-accent hover:text-accent-foreground h-16 w-16'
            >
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
                class='h-8 w-8'
              >
                <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'></path>
                <polyline points='17 8 12 3 7 8'></polyline>
                <line x1='12' x2='12' y1='3' y2='15'></line>
              </svg>
              <span class='sr-only'>Upload image</span>
            </button>
            <input
              type='file'
              ref={fileInput}
              className='focus:ouline-none'
              style={{ display: 'none' }}
              multiple
              onChange={handleFileChange}
            />
            <img
              style={{ width: '350px', height: '350px' }}
              src={changed ? imageUrl : `data:image/png;base64,${imageUrl}`}
              alt='Image'
              className='rounded-md'
            />
          </div>
          <div className='flex flex-col w-full space-y-4 items-center'>
            <input
              placeholder='Username'
              disabled
              className='w-11/12 border bg-stone-200 text-md px-2 h-10 focus:outline-none shadow-sm rounded-sm disabled'
              value={newUsername}
              onChange={(e) => {
                setNewUsername(e.target.value);
              }}
            ></input>
            <input
              placeholder='Caption...'
              className='w-11/12 border bg-stone-50 text-md px-2 h-10 focus:outline-none shadow-sm rounded-sm'
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
              }}
            ></input>
            <input
              placeholder='Email...'
              className='w-11/12 focus:outline-none border bg-stone-50 text-md px-2 h-10 outline-none shadow-sm rounded-sm'
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            ></input>
            <div className='flex w-11/12 border bg-stone-50 text-md pl-2 h-10 outline-none shadow-sm rounded-sm'>
              <input
                className='w-full h-full focus:outline-none bg-stone-50 !important cursor-pointer'
                type={showPassword ? 'text' : 'password'}
                placeholder='Password....'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {/* <img
                onClick={handleImageClick}
                src={showPassword ? visible : hidden}
                className='bg-cyan-950 p-2 h-10 w-10 -mt-0.5 -mr-1 rounded-md border-2'
              ></img> */}
              {showPassword ? (
                <div className='flex items-center w-9 justify-center  bg-black'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='white'
                    stroke-width='2'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    class=' my-auto h-6 w-5 text-white'
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                  >
                    <path d='M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z'></path>
                    <circle cx='12' cy='12' r='3'></circle>
                  </svg>
                </div>
              ) : (
                <div className='flex items-center w-9 justify-center  bg-black'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='white'
                    stroke-width='2'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    class='  my-auto h-6 w-5 text-white'
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                  >
                    <path d='M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z'></path>
                    <circle cx='12' cy='12' r='3'></circle>
                    <path d='M6 6l12 12' stroke='currentColor' stroke-width='2'></path>
                  </svg>
                </div>
              )}
            </div>
          </div>
          <div className='flex w-[92%] space-x-4 justify-start'>
            <button
              onClick={async () => {
                await updateProfile();
              }}
              className='font-light w-1/6 py-1 bg-black text-white text-xl rounded-md'
            >
              Save
            </button>
            <button
              onClick={async () => {
                navigate('/app/profile');
              }}
              className='font-light w-1/6 py-1 bg-stone-100 border shadow-sm border-gray-300 text-black text-xl rounded-md'
            >
              Cancel
            </button>
          </div>
        </div>
        {isLargeScreen && <PYMK username={username}></PYMK>}
      </div>
    </div>
  );
};

export default EditProfile;
