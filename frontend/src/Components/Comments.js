import React, { useEffect } from 'react';
import profile from '../Images/profile.png';
import like from '../Images/like.png';
import Comment_like from './Comment_Like';
import remove from '../Images/remove.png';
import bin1 from '../Images/bin1.png';
import { socket } from './DashBoard';
import { useState } from 'react';
import { useRef } from 'react';
import { useIndex } from './IndexContext';
import EmojiPicker from 'emoji-picker-react';
import RoundedBtn from './RoundButton';
import { BiHappy } from 'react-icons/bi';
const buildTree = (comments) => {
  const commentMap = new Map();
  comments.forEach((comment) => {
    const replyId = comment.reply_id;
    if (!commentMap.has(replyId)) {
      commentMap.set(replyId, []);
    }
    commentMap.get(replyId).push(comment);
  });
  const buildSubtree = (commentId) => {
    const children = commentMap.get(commentId) || [];
    children.forEach((child) => {
      child.children = buildSubtree(child.comment_id);
    });

    return children;
  };
  const rootNodes = buildSubtree(-1);

  return rootNodes;
};
const Commentdis = ({ comments }) => {
  const arr1 = [];
  const map = new Map();
  const filteredComments = comments.filter((comment) => comment.reply_id === -1);
  filteredComments.sort((a, b) => {
    const dateA = new Date(`${a.year}-${a.month}-${a.date}`);
    const dateB = new Date(`${b.year}-${b.month}-${b.date}`);

    if (dateB.getTime() !== dateA.getTime()) {
      return dateB.getTime() - dateA.getTime(); // Sort by date if dates are different
    } else {
      const timeA = parseInt(a.hour) * 60 + parseInt(a.minutes);
      const timeB = parseInt(b.hour) * 60 + parseInt(b.minutes);
      return timeB - timeA;
    }
  });
  const tree = buildTree(comments);
  const performDFS = (node) => {
    if (!node) return;
    arr1.push(node);
    node.children.forEach((child) => {
      performDFS(child);
    });
  };
  tree.forEach((rootNode) => {
    performDFS(rootNode);
    // console.log(arr1);
  });
  return arr1;
};
const getTimeDifference = (comment) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // Months are zero-based, so we add 1 to get the correct month
  const currentDay = new Date().getDate();
  const currentHour = new Date().getHours();
  const currentMinutes = new Date().getMinutes();
  const commentYear = parseInt(comment.year);
  const commentMonth = parseInt(comment.month);
  const commentDay = parseInt(comment.date);
  const commentHour = parseInt(comment.hour);
  const commentMinutes = parseInt(comment.minutes);

  const yearsDifference = currentYear - commentYear;
  const monthsDifference = currentMonth - commentMonth;
  const daysDifference = currentDay - commentDay;
  const hoursDifference = currentHour - commentHour;
  const minutesDifference = currentMinutes - commentMinutes;

  if (yearsDifference > 0) {
    return yearsDifference + 'y';
  } else if (monthsDifference > 0) {
    return monthsDifference + 'm';
  } else if (daysDifference >= 7) {
    return Math.floor(daysDifference / 7) + 'w';
  } else if (daysDifference > 0) {
    return daysDifference + 'd';
  } else if (hoursDifference > 0) {
    return hoursDifference + 'h';
  } else if (minutesDifference > 0) {
    return minutesDifference + 'm';
  } else {
    return 'Just now';
  }
};
const Comments = ({ id, comments1 }) => {
  const [commentdisplay, setcommentdisplay] = useState([]);
  const [map, setMap] = useState(new Map());
  const [replyid, setReplyId] = useState(-1);
  const [replycomment, setReplyComment] = useState([]);
  const [value, setValue] = useState('');
  const scrollRef = useRef(null);
  const { username } = useIndex();
  const [comments, setcomments] = useState([...comments1]);
  const [delete1, setdelete1] = useState(false);
  const [emoji, setemoji] = useState(false);
  console.log(comments1);
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
      reply_id: replyid,
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
    const result = await response.json();
    setValue('');
    try {
      socket.connect();
      socket.emit('send_comment', { id, username });
    } catch (err) {
      console.log(err);
    }
    var raw1 = {
      ampm,
      children: [],
      comment: value,
      comment_id: result.id,
      comment_type: 'reply',
      day: String(date.getDay()),
      date: String(date.getDate()),
      hour: String(date.getHours() % 60),
      minutes: String(date.getMinutes() % 60),
      month: String(date.getMonth()),
      post_id: id,
      reply_id: replyid,
      username,
      year: String(date.getFullYear()),
    };
    setcomments((prevMessages) => [...prevMessages, raw1]);
    setReplyId(-1);
    setReplyComment([]);
  };
  const handleEmojiClick = (event) => {
    console.log(event.emoji);
    setValue((prevInput) => prevInput + event.emoji);
  };
  console.log(comments);
  const scrollToComment = (commentId) => {
    const commentElement = document.getElementById(`comment-${commentId}`);
    if (commentElement) {
      commentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const getusernameofpost = async () => {
    try {
      var myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');

      var raw = JSON.stringify({
        id,
      });

      var requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      };

      const response = await fetch('http://localhost:3001/fetchpostuserbyid', requestOptions);
      const result = await response.json();
      console.log(result.data);
      if (result.data.user_name === username) {
        setdelete1(true);
      }
    } catch (err) {
      console.log(err.message);
      return 0;
    }
  };
  const fetchcomment = async (id) => {
    try {
      var myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');

      var raw = JSON.stringify({
        id,
      });

      var requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      };

      const response = await fetch('http://localhost:3001/fetchcomment', requestOptions);
      const result = await response.json();
      console.log(result.data);
      setcomments([...result.data]);
      map.clear();
      result.data &&
        result.data.map((comment1) => {
          map.set(comment1.comment_id, comment1);
        });
      const arr = Commentdis({ comments: result.data });
      setcommentdisplay(arr);
      // return result.data.length;
    } catch (err) {
      console.log(err.message);
      return 0;
    }
  };
  const deletecomment = async (id1) => {
    try {
      var myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');

      var raw = JSON.stringify({
        id: id1,
      });

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      };

      const response = await fetch('http://localhost:3001/deletecomment', requestOptions);
      setcomments((prevMessages) => prevMessages.filter((message) => message.comment_id !== id1));
      // await fetchcomment(id);
    } catch (err) {
      console.log(err.message);
    }
  };
  const getReplyComment = async (id) => {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    var raw = JSON.stringify({
      id,
    });

    var requestOptions = {
      method: 'PUT',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    const response = await fetch('http://localhost:3001/fetchcommentbyid', requestOptions);
    const result = await response.json();
    console.log(result.data);
    setReplyComment(result.data);
    setReplyId(id);
    console.log(replycomment);
  };
  useEffect(() => {
    map.clear();
    // console.log('comments chane')
    comments.map((comment1) => {
      map.set(comment1.comment_id, comment1);
    });
    const arr = Commentdis({ comments: comments });
    console.log(arr);
    setcommentdisplay(arr);
    console.log(commentdisplay);
  }, [comments]);
  // useEffect(() => {
  //   try {
  //     socket.connect();
  //     socket.on('commented', async () => {
  //       console.log('commentrecievd');
  //       await fetchcomment(id);
  //     });
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }, []);
  useEffect(() => {
    map.clear();
    comments &&
      comments.map((comment1) => {
        map.set(comment1.comment_id, comment1);
      });
    setcomments(comments1);
    const arr = Commentdis({ comments });
    setcommentdisplay(arr);
  }, [username]);
  useEffect(() => {
    getusernameofpost();
  }, [username]);
  useEffect(() => {
    try {
      socket.connect();
      socket.emit('newUser', username);
    } catch (error) {
      console.log(error);
    }
  }, []);

  return (
    <div className='flex flex-col w-full h-full overflow-y-scroll'>
      <div className='text-2xl font-medium'>Comments</div>
      <div className='w-full h-[2px] bg-gray-200 my-2'></div>
      <div className='w-full h-[90%]'>
        {commentdisplay &&
          commentdisplay.map((comment2) =>
            comment2.reply_id !== -1 ? (
              <div
                key={comment2.comment_id}
                className={`border-2 border-gray-200 my-1.5 px-1 py-0.5 rounded-md shadow-sm text-sky-950 items-center ${
                  comment2.reply_id !== -1 ? 'ml-auto bg-sky-100' : 'bg-orange-50'
                }`}
                style={{ width: 'max-content' }}
              >
                {/* {console.log(map.get(comment2.reply_id))} */}
                <div className='flex items-center space-x-2 max-w-5/6 p-1'>
                  <div className='flex flex-col'>
                    <div className='flex flex-row items-center space-x-8 justify-between'>
                      <div className='flex flex-row items-center space-x-1'>
                        <img src={profile} className='h-12 w-12' alt='Profile'></img>
                        <div className='text-xl font-medium'>{comment2.username}</div>
                        <div className='text-sm font-regular text-gray-500'>
                          {getTimeDifference(comment2)}
                        </div>
                      </div>
                      <div className='flex items-center mt-0.5 space-x-1'>
                        {/* <div className='flex flex-row items-center mt-0.5 space-x-1'> */}
                        {(delete1 || comment2.username === username) && (
                          <img
                            src={bin1}
                            onClick={() => {
                              deletecomment(comment2.comment_id);
                            }}
                            className='w-4 h-4 mr-1'
                          ></img>
                        )}
                        <button
                          onClick={async () => {
                            try {
                              // socket.connect();
                              // socket.emit('replycomm', [username, comment2.comment_id]);
                              await getReplyComment(comment2.comment_id);
                            } catch (err) {
                              console.log(err);
                            }
                          }}
                          className='text-sm py-0.5 px-1 rounded-md bg-sky-300'
                        >
                          Reply
                        </button>
                        <Comment_like id={comment2.comment_id} username={username}></Comment_like>
                        {/* </div> */}
                      </div>
                    </div>
                    {/* <div className="bg-white my-1">{map.get(comment2.reply_id).comment}</div> */}
                    <div
                      key={map.get(comment2.reply_id).comment_id}
                      className={`border-2 border-gray-200 my-1.5 w-full rounded-md shadow-lg text-sky-950 items-center bg-white mx-auto`}
                      style={{ maxWidth: 'calc(100% - 0.5rem)' }} // Adjusted max width to maintain equal spacing
                      onClick={() => scrollToComment(comment2.reply_id)}
                    >
                      <div className='flex items-center space-x-2 max-w-5/6 p-1'>
                        <img src={profile} className='h-10 w-10' alt='Profile'></img>
                        <div className='flex flex-col'>
                          <div className='flex flex-row items-center justify-between'>
                            <div className='flex flex-row items-center space-x-1'>
                              <div className='text-lg font-medium'>
                                {map.get(comment2.reply_id).username}
                              </div>
                              <div className='text-sm font-regular text-gray-500'>
                                {getTimeDifference(map.get(comment2.reply_id))}
                              </div>
                            </div>
                          </div>
                          <div className='text-sm font-regular -mt-1 ml-0.5'>
                            {map.get(comment2.reply_id).comment}
                          </div>
                        </div>
                      </div>
                      <div className='flex justify-center'></div>
                    </div>
                    <div className='text-md font-regular'>{comment2.comment}</div>
                  </div>
                </div>
                <div className='flex justify-center'></div>
              </div>
            ) : (
              <div
                key={comment2.comment_id}
                className={`border-2 border-gray-200 my-1.5 rounded-md shadow-sm text-sky-950 items-center ${
                  comment2.reply_id !== -1 ? 'ml-auto bg-sky-100' : 'bg-orange-50'
                }`}
                style={{ width: 'max-content' }}
              >
                <div className='flex items-center space-x-2 max-w-5/6 p-1'>
                  <img src={profile} className='h-12 w-12' alt='Profile'></img>
                  <div className='flex flex-col'>
                    <div className='flex flex-row items-center space-x-8 justify-between'>
                      <div className='flex flex-row items-center space-x-1'>
                        <div className='text-xl font-medium'>{comment2.username}</div>
                        <div className='text-sm font-regular text-gray-500'>
                          {getTimeDifference(comment2)}
                        </div>
                      </div>
                      <div className='flex items-center mt-0.5 space-x-1'>
                        {(delete1 || comment2.username === username) && (
                          <img
                            src={bin1}
                            onClick={() => {
                              deletecomment(comment2.comment_id);
                            }}
                            className='w-4 h-4 mr-1'
                          ></img>
                        )}
                        <button
                          onClick={async () => {
                            try {
                              // socket.connect();
                              // socket.emit('replycomm', [username, comment2.comment_id]);
                              // setReplyId(comment2.comment_id);
                              // await
                              await getReplyComment(comment2.comment_id);
                            } catch (err) {
                              console.log(err);
                            }
                          }}
                          className='text-sm py-0.5 px-1 rounded-md bg-sky-300'
                        >
                          Reply
                        </button>
                        <Comment_like id={comment2.comment_id} username={username}></Comment_like>
                        {console.log(delete1)}
                      </div>
                    </div>
                    <div className='text-md font-regular'>{comment2.comment}</div>
                  </div>
                </div>
                <div className='flex justify-center'></div>
              </div>
            ),
          )}
      </div>
      <div className='flex flex-row space-x-2 items-center'>
        <div className='-mb-2  w-full'>
          {/* <MainComment id={post.id} username={username}></MainComment> */}
          <div className='flex flex-col -mt-3 relative'>
            {emoji && (
              <div className='flex flex-row justify-end absolute right-0 border-2  border-sky-300 rounded-xl bottom-full '>
                <EmojiPicker height={400} width={300} onEmojiClick={handleEmojiClick}></EmojiPicker>
              </div>
            )}
            {replyid !== -1 && (
              <div
                key={replycomment[0].comment_id}
                className='bg-orange-50 border-2 w-auto border-gray-200  rounded-md shadow-sm text-sky-950 items-center'
                // style={{ width: 'max-content' }}
              >
                <div className='flex items-center space-x-2 max-w-5/6 p-1'>
                  <img src={profile} className='h-12 w-12'></img>
                  <div className='flex flex-col'>
                    <div className='flex flex-row items-center space-x-8 justify-between'>
                      <div className='flex flex-row items-center space-x-1'>
                        <div className='text-xl font-medium'>{replycomment[0].username}</div>
                        <div className='text-sm font-regular text-gray-500'>
                          {getTimeDifference(replycomment[0])}
                        </div>
                      </div>
                      <div className='flex items-center mt-0.5 space-x-1'></div>
                    </div>
                    <div className='text-md font-regular'>{replycomment[0].comment}</div>
                  </div>
                </div>
                <img
                  src={remove}
                  className='h-4 w-4 absolute -top-3 -right-0.5'
                  onClick={() => {
                    setReplyComment([]);
                    setReplyId(-1);
                  }}
                ></img>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className='flex flex-row h-11 w-full mt-2  bg-white border-2 border-sky-300 shadow-sm rounded-md py-1 items-center'>
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

export default Comments;
