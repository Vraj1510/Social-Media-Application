import React, { useEffect, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import RoundedBtn from './RoundButton';
import { BiHappy } from 'react-icons/bi';
import { socket } from './DashBoard';
import profile from '../Images/profile.png';
import { useIndex } from './IndexContext';
const MainComment = ({ id }) => {
  const { username } = useIndex();
  const [imageURL, setImageURL] = useState();
  const insertcomment = async () => {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    var date = new Date();
    var ampm = 'AM';
    if (date.getHours() > 12) {
      ampm = 'PM';
    }
    var raw = JSON.stringify({
      id,
      username,
      value,
      comment_type: 'reply',
      reply_id: -1,
      minutes: date.getMinutes() % 60,
      hour: date.getHours() % 60,
      day: date.getDay(),
      date: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      ampm,
    });
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
    };
    const response = await fetch('http://localhost:3001/insertcomment', requestOptions);
    await response.json();
    setValue('');
    try {
      socket.connect();
      socket.emit('send_comment', { id, username });
    } catch (err) {
      console.log(err);
    }
  };

  const fetchProfileImage = async () => {
    try {
      var username1 = username;
      const body = { username1 };
      const response = await fetch('http://localhost:3001/fetchImage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      console.log(result);
      setImageURL(result.imageContent);
    } catch (err) {
      console.error('Error fetching image:', err.message);
    }
  };
  const [value, setValue] = useState('');
  const [emoji, setemoji] = useState(false);
  const handleEmojiClick = (event) => {
    console.log(event.emoji);
    setValue((prevInput) => prevInput + event.emoji);
  };
  useEffect(() => {
    fetchProfileImage();
  }, [username]);
  return (
    <div className='flex flex-col -mt-3 relative'>
      {emoji && (
        <div className='flex flex-row justify-end absolute right-0 border border-gray-400 rounded-md bottom-full '>
          <EmojiPicker height={400} width={300} onEmojiClick={handleEmojiClick}></EmojiPicker>
        </div>
      )}
      {/* <div className='flex flex-row h-11 w-[97%] mt-4 ml-2.5 bg-white rounded-md py-1 items-center'>
        <input
          placeholder='Add A Comment'
          value={value}
          className='px-2 w-full outline-none'
          onChange={(e) => setValue(e.target.value)}
        ></input>
        <button
          onClick={() => {
            if (value !== '') {
              insertcomment();
            }
          }}
          className='bg-sky-300 rounded-md text-sky-900 border-2 border-sky-600 my-1 px-2'
        >
          Post
        </button>
        <RoundedBtn
          onClick={() => {
            setemoji(!emoji);
          }}
          size='25px'
          icon={<BiHappy />}
        />
      </div> */}
      <div class='flex items-center mt-4 -mb-1 px-3'>
        <img src={`data:image/png;base64,${imageURL}`} className='h-9 w-9 rounded-full mr-2' />
        <input
          class='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 flex-1'
          type='text'
          placeholder='Add a comment...'
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          onClick={() => {
            setemoji(!emoji);
          }}
          class='inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10'
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
            class='h-5 w-5'
          >
            <circle cx='12' cy='12' r='10'></circle>
            <path d='M8 14s1.5 2 4 2 4-2 4-2'></path>
            <line x1='9' x2='9.01' y1='9' y2='9'></line>
            <line x1='15' x2='15.01' y1='9' y2='9'></line>
          </svg>
          <span class='sr-only'>Add emoji</span>
        </button>
        <button
          onClick={() => {
            if (value !== '') {
              insertcomment();
            }
          }}
          class='inline-flex items-center -ml-1 justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10'
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
            class='h-5 w-5'
          >
            <path d='m22 2-7 20-4-9-9-4Z'></path>
            <path d='M22 2 11 13'></path>
          </svg>
          <span class='sr-only'>Send comment</span>
        </button>
      </div>
    </div>
  );
};

export default MainComment;
