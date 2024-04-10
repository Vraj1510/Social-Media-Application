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
    <img
      onClick={likePostHandle}
      src={liked ? like1 : like}
      className='w-7 h-7 lg:w-8 lg:h-8 md:w-8 md:h-8'
      alt='Like Icon'
    />
  );
}

export default Like;
