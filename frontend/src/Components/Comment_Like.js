import React, { useEffect, useState } from 'react';
import like from '../Images/like.png';
import like1 from '../Images/like1.png';
import { socket } from './DashBoard';
import { useIndex } from './IndexContext';
function Comment_like({ id }) {
  const [liked, setLiked] = useState(false);
  // find username of the post
  const { username } = useIndex();
  console.log(id);
  const likeCommentHandle = async () => {
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

      const response = await fetch('http://localhost:3001/handlecommentlikes', requestOptions);
      const data = await response.json();
      console.log(data);
      setLiked(data.success === 'true');
      if (data.success === true) {
        console.log('done');
        try {
          await socket.connect();
          await socket.emit('send_comment_like', [username, id]);
        } catch (err) {
          console.log(err);
        }
      } else {
        try {
          await socket.connect();
          await socket.emit('delete_comment_like', [data.user, username]);
        } catch (err) {
          console.log(err);
        }
      }
      await likeCommentCheck();
    } catch (error) {
      console.error('Error handling likes:', error.message);
    }
  };

  const likeCommentCheck = async () => {
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

      const response = await fetch('http://localhost:3001/checkcommentlike', requestOptions);
      const data = await response.json();
      console.log(data);
      setLiked(data.success === true);
    } catch (error) {
      console.error('Error checking likes:', error.message);
    }
  };

  useEffect(() => {
    likeCommentCheck();
  }, []);

  return (
    <img
      onClick={likeCommentHandle}
      src={liked ? like1 : like}
      className='w-[1.5rem] h-[1.5rem]'
      alt='Like Icon'
    />
  );
}

export default Comment_like;
