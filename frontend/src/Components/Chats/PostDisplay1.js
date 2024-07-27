import React, { useEffect, useState } from 'react';

const PostDisplay = ({ post }) => {
  const [profile, setProfile] = useState('');
  const [mypost, setMyPost] = useState(post);
  console.log(post);
  const fetchprofile = async () => {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    const raw = JSON.stringify({
      username1: post.user_name,
    });

    const requestOptions = {
      method: 'PUT',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    const response = await fetch('http://localhost:3001/fetchImage', requestOptions);
    const result = await response.json();
    setProfile(result.imageContent);
  };
  useEffect(() => {
    fetchprofile();
  }, [post]);
  return (
    <div className='flex flex-col w-[100%]'>
      <div className='flex space-x-1.5 items-center'>
        <img src={`data:image/png;base64,${profile}`} className='h-9 w-9 rounded-full'></img>
        <div className='text-xl font-light text-sky-950'>{mypost.user_name}</div>
      </div>
      <div className='h-[1px] bg-gray-300 mt-1.5 mb-2'></div>
      <img
        src={`data:image/png;base64,${post.pictures[0]}`}
        className='h-72 w-72'
      ></img>
      <div className='text-md mt-1 ml-1 text-sky-950'>{mypost.caption}</div>
    </div>
  );
};

export default PostDisplay;
