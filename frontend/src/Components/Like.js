import React, { useEffect, useState } from 'react';
import like from '../Images/like.png';
import like1 from '../Images/like1.png';
import { socket } from './DashBoard';
import { useIndex } from './IndexContext';
function Like({ id }) {
  const [liked, setLiked] = useState(false);
  const { username } = useIndex();
  // find username of the post
  const likePostHandle = async () => {
    try {
      var myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      const body1 = { id, username };
      var raw = JSON.stringify(body1);
      var requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: raw,
      };

      const response = await fetch('http://localhost:3001/handlelikes', requestOptions);
      const data = await response.json();
      console.log(data);
      setLiked(data.success === 'true');
      if (data.success === true) {
        console.log('done');
        try {
          await socket.connect();
          await socket.emit('send_like', [username, id]);
        } catch (err) {
          console.log(err);
        }
      } else {
        try {
          await socket.connect();
          await socket.emit('delete_like', [data.user, username]);
        } catch (err) {
          console.log(err);
        }
      }
      await likePostCheck();
    } catch (error) {
      console.error('Error handling likes:', error.message);
    }
  };

  const likePostCheck = async () => {
    try {
      var myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      const body1 = { id, username };
      var raw = JSON.stringify(body1);
      var requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: raw,
      };

      const response = await fetch('http://localhost:3001/checklike', requestOptions);
      const data = await response.json();
      console.log(data);
      setLiked(data.success === true);
    } catch (error) {
      console.error('Error checking likes:', error.message);
    }
  };

  useEffect(() => {
    likePostCheck();
  }, [username]);

  return (
    // <img
    <button class='inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10'>
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
        <path d='M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'></path>
      </svg>
      <span class='sr-only'>Like</span>
    </button>
  );
}

export default Like;
