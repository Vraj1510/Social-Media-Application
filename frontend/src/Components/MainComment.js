import React, { useEffect, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import RoundedBtn from './RoundButton';
import { BiHappy } from 'react-icons/bi';
import { socket } from './DashBoard';
import profile from '../Images/profile.png';
import { useIndex } from './IndexContext';
const MainComment = ({ id }) => {
  const { username } = useIndex();
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
  const [value, setValue] = useState('');
  const [emoji, setemoji] = useState(false);
  const handleEmojiClick = (event) => {
    console.log(event.emoji);
    setValue((prevInput) => prevInput + event.emoji);
  };
  return (
    <div className='flex flex-col -mt-3 relative'>
      {emoji && (
        <div className='flex flex-row justify-end absolute right-0 border-2  border-sky-300 rounded-xl bottom-full '>
          <EmojiPicker height={400} width={300} onEmojiClick={handleEmojiClick}></EmojiPicker>
        </div>
      )}
      <div className='flex flex-row h-11 w-full mt-2 bg-white border-2 border-sky-300 shadow-sm rounded-md py-1 items-center'>
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
      </div>
    </div>
  );
};

export default MainComment;
