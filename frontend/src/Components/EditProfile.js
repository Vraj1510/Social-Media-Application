import React, { useState } from 'react';
import { useEffect } from 'react';
import { useIndex } from './IndexContext';
import Sidebar from './Sidebar';
import PYMK from './PYMK';
import { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import visible from '../Images/visible.png';
import hidden from '../Images/hidden.png';
const EditProfile = () => {
  const { state } = useLocation();
  const [file, setFile] = useState(null);
  const { username } = useIndex();
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

  return (
    <div className='md:h-auto lg:h-auto w-screen h-screen'>
      <div
        className={`flex  ${
          isSmallScreen ? 'flex-col flex-col-wrap overflow-y-scroll -mt-1' : 'flex-row'
        } w-screen h-screen justify-between lg:justify-between`}
      >
        {!isSmallScreen && <Sidebar index={1} username={username}></Sidebar>}
        {isSmallScreen && (
          <div className='w-screen h-auto mt-2'>
            {' '}
            <Sidebar index={1} username={username}></Sidebar>
          </div>
        )}
        <div className='flex flex-col h-[95%] justify-around items-center w-[50%] mt-2.5 rounded-md bg-orange-50 border-2 border-orange-200'>
          <div className='flex flex-row items-center space-x-20'>
            <img
              style={{ width: '350px', height: '350px' }}
              src={changed ? imageUrl : `data:image/png;base64,${imageUrl}`}
              alt='Image'
            />

            <button
              onClick={() => fileInput.current.click()}
              className='text-cyan-950 border-2 border-sky-400 w-24 lg:w-44 md:w-28 md:h-12 lg:h-16 h-10 bg-cyan-100 text-lg md:text-xl lg:text-xl rounded-lg md:mt-6 lg:mt-6'
            >
              Choose Image
            </button>
            <input
              type='file'
              ref={fileInput}
              style={{ display: 'none' }}
              multiple
              onChange={handleFileChange}
            />
          </div>
          <div className='flex flex-col w-full space-y-4 items-center'>
            <input
              placeholder='Username'
              disabled
              className='w-11/12 border-2 text-lg px-1.5 h-10 outline-none border-orange-200 shadow-md rounded-md disabled'
              value={newUsername}
              onChange={(e) => {
                setNewUsername(e.target.value);
              }}
            ></input>
            <input
              placeholder='Caption...'
              className='w-11/12 border-2 text-lg px-1.5 h-10 outline-none border-orange-200 shadow-md rounded-md'
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
              }}
            ></input>
            <input
              placeholder='Email...'
              className='w-11/12 border-2 text-lg px-1.5 h-10 outline-none border-orange-200 shadow-md rounded-md'
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            ></input>
            <div className='flex w-11/12 border-2 text-lg pl-1.5 h-10 outline-none border-orange-200 shadow-md rounded-md'>
            
              <input
                className='w-full h-full outline-none !important cursor-pointer'
                type={showPassword ? 'text' : 'password'}
                placeholder='Password....'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <img
                onClick={handleImageClick}
                src={showPassword ? visible : hidden}
                className='bg-cyan-950 p-2 h-10 w-10 -mt-0.5 -mr-1 rounded-md border-2 border-orange-200'
              ></img>
            </div>
          </div>
          <div className='flex w-[92%] justify-end'>
            <button
              onClick={async () => {
                await updateProfile();
              }}
              className='font-light w-1/6 py-2 bg-cyan-900 text-white text-2xl border-2 border-cyan-600 rounded-md'
            >
              Save
            </button>
          </div>
        </div>
        {isLargeScreen && <PYMK username={username}></PYMK>}
      </div>
    </div>
  );
};

export default EditProfile;
