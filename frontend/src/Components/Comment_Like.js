import React, { useEffect, useState } from 'react';
import like from '../Images/like.png';
import like1 from '../Images/like1.png';
import remove from '../Images/remove.png';
import { socket } from './DashBoard';
import { useIndex } from './IndexContext';
import Users from './Users';
function Comment_like({ id }) {
  const [liked, setLiked] = useState(false);
  const [likelist, setLikeList] = useState([]);
  const { username } = useIndex();
  const [displaylikes, setdisplaylikes] = useState(false);
  console.log(id);
  const fetchcommentlikes = async () => {
    try {
      const body = JSON.stringify({ id }); // stringify the body object
      var myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      var requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: body, // pass the stringified body
      };
      const response = await fetch('http://localhost:3001/fetchcommentlikes', requestOptions);
      const result = await response.json();
      console.log(result);
      const finalresult = result.data.map((entry1) => {
        return { ...entry1, user_name: entry1.username };
      });
      setLikeList([...finalresult]);

      console.log(finalresult);
    } catch (err) {
      console.log(err.message);
    }
  };

  const likeCommentHandle = async () => {
    try {
      var myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      const body1 = { id, username };
      console.log(id);
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
          // data.useIndex
          console.log(data.idx);
          const newlike = { username, id: data.idx, comment_id: id };
          setLikeList((prevList) => [...prevList, newlike]);
          await socket.emit('send_comment_like', [username, id]);
        } catch (err) {
          console.log(err);
        }
      } else {
        try {
          await socket.connect();
          const filteredLikeList = likelist.filter((item) => {
            return item.username === username;
          });

          setLikeList(filteredLikeList);

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
    fetchcommentlikes();
  }, []);

  return (
    <div className='flex flex-col items-center -space-y-1 -mb-3 mt-1'>
      <img
        onClick={likeCommentHandle}
        src={liked ? like1 : like}
        className='w-[1.5rem] h-[1.5rem]'
        alt='Like Icon'
      />
      <div
        onClick={() => {
          setdisplaylikes(true);
        }}
      >
        {likelist.length}
      </div>
      {displaylikes && (
        <div className='fixed inset-0 flex justify-center items-center z-50 backdrop-filter backdrop-blur-sm bg-black bg-opacity-50'>
          <div className='flex flex-col w-1/4 px-4 h-5/6 rounded-md bg-white'>
            <div className='flex w-full justify-between'>
              <div className='text-3xl font-normal my-4 ml-1 text-black'>Likes</div>
              <img
                src={remove}
                className='h-5 w-5 -mt-2 -mr-5'
                onClick={() => {
                  setdisplaylikes(false);
                }}
              ></img>
            </div>
            <Users list={[...likelist]}></Users>
          </div>
        </div>
      )}
    </div>
  );
}

export default Comment_like;
