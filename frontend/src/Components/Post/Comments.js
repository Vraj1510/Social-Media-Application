import React, { useEffect } from 'react';
import profile from '../../Images/profile.png';
import like from '../../Images/like.png';
import Comment_like from './Comment_Like';
import remove from '../../Images/remove.png';
import bin1 from '../../Images/bin1.png';
import { socket } from '../Home/DashBoard';
import { useState } from 'react';
import { useRef } from 'react';
import { useIndex } from '../IndexContext/IndexContext';
import EmojiPicker from 'emoji-picker-react';
import { BiHappy } from 'react-icons/bi';

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
  const [imageURL, setImageURL] = useState();
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
  const fetchProfileImage = async (username1) => {
    try {
      const body = { username1 };
      const response = await fetch('http://localhost:3001/fetchImage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      return `data:image/png;base64,${result.imageContent}`;
    } catch (err) {
      console.error('Error fetching image:', err.message);
    }
  };

  const fetchProfileImage1 = async () => {
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

  useEffect(() => {
    fetchProfileImage1();
  }, [username]);

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

  const Commentdis = async () => {
    const arr1 = [];
    const map = new Map();
    const filteredComments = commentsWithProfile.filter((comment) => comment.reply_id === -1);
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
    const tree = buildTree(commentsWithProfile);
    const performDFS = (node) => {
      if (!node) return;
      arr1.push(node);
      node.children.forEach((child) => {
        performDFS(child);
      });
    };
    tree.forEach((rootNode) => {
      performDFS(rootNode);
    });
    console.log(arr1);
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
      return monthsDifference + 'M';
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
  // useEffect(() => {
  //   map.clear();

  //   comments.map((comment1) => {
  //     map.set(comment1.comment_id, comment1);
  //   });
  //   const arr = Commentdis({ comments: comments });
  //   console.log(arr);
  //   setcommentdisplay(arr);
  //   console.log(commentdisplay);
  // }, [comments]);
  useEffect(() => {
    map.clear();
    const fetchData = async () => {
      const updatedComments = await Promise.all(
        comments.map(async (comment1) => {
          const profile = await fetchProfileImage(comment1.username);
          return { ...comment1, profile };
        }),
      );
      setCommentsWithProfile(updatedComments);
    };

    fetchData();
  }, [username]);
  useEffect(() => {
    getusernameofpost();
  }, [username]);
  const [commentsWithProfile, setCommentsWithProfile] = useState([]);

  useEffect(() => {
    map.clear();
    const fetchData = async () => {
      const updatedComments = await Promise.all(
        comments.map(async (comment1) => {
          const profile = await fetchProfileImage(comment1.username);
          return { ...comment1, profile };
        }),
      );
      setCommentsWithProfile(updatedComments);
    };

    fetchData();
  }, [comments]);
  useEffect(() => {
    console.log(commentsWithProfile);
    commentsWithProfile.map((comment1) => {
      map.set(comment1.comment_id, comment1);
    });
    console.log(map.get(115));
  }, [commentsWithProfile]);
  useEffect(() => {
    // map.clear();
    Commentdis().then((arr) => {
      console.log(arr);
      setcommentdisplay(arr);
      console.log(commentdisplay);
    });
  }, [commentsWithProfile]);

  return (
    <div className='flex flex-col w-full h-full overflow-y-scroll'>
      <div className='text-2xl font-medium'>Comments</div>
      <div className='w-full h-[2px] bg-gray-200 my-2'></div>
      <div className='w-full h-[100%] overflow-y-scroll'>
        {console.log(commentdisplay)}
        {commentdisplay.length > 0 &&
          commentdisplay.map((comment2) =>
            comment2.reply_id !== -1 ? (
              <div
                key={comment2.comment_id}
                className={`border my-1.5 px-1 py-1 rounded-md shadow-md text-sky-950 items-center ${
                  comment2.reply_id !== -1 ? 'ml-auto bg-stone-100' : 'bg-stone-100'
                }`}
                style={{ width: 'max-content' }}
              >
                {/* {console.log(map.get(comment2.reply_id))} */}
                <div className='flex items-center space-x-2 max-w-5/6 p-1'>
                  <div className='flex flex-col'>
                    <div className='flex flex-row items-center space-x-16 justify-between'>
                      <div className='flex flex-row items-center space-x-1.5'>
                        <img
                          src={comment2.profile}
                          className='h-12 w-12 rounded-full'
                          alt='Profile'
                        ></img>
                        <div className='text-xl font-medium'>{comment2.username}</div>
                        <div className='text-sm font-regular text-gray-500'>
                          {getTimeDifference(comment2)}
                        </div>
                      </div>
                      <div className='flex items-center -mt-1 space-x-1'>
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
                      </div>
                    </div>
                    {console.log(map)}
                    {map.get(comment2.reply_id) && (
                      <div
                        key={map.get(comment2.reply_id).comment_id}
                        className={`border my-1 mt-2 p-0.5 w-full rounded-md shadow-sm text-sky-950 items-center bg-white mx-auto`}
                        style={{ maxWidth: 'calc(100% - 0.5rem)' }} // Adjusted max width to maintain equal spacing
                        onClick={() => scrollToComment(comment2.reply_id)}
                      >
                        <div className='flex items-center space-x-2 max-w-5/6 p-1'>
                          <img
                            src={map.get(comment2.reply_id).profile}
                            className='rounded-full h-10 w-10'
                            alt='Profile'
                          ></img>
                          <div className='flex flex-col'>
                            <div className='flex flex-row items-center justify-between'>
                              <div className='flex flex-row items-center space-x-1'>
                                <div className='text-lg font-medium'>
                                  {console.log(map.get(comment2.reply_id))}
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
                    )}
                    <div className='text-md font-regular ml-1'>{comment2.comment}</div>
                  </div>
                </div>
                <div className='flex justify-center'></div>
              </div>
            ) : (
              <div
                key={comment2.comment_id}
                className={`border my-1.5 py-0.5 rounded-md shadow-sm text-sky-950 items-center ${
                  comment2.reply_id !== -1 ? 'ml-auto bg-stone-100' : 'bg-stone-100'
                }`}
                style={{ width: 'max-content' }}
              >
                <div className='flex items-center space-x-2 max-w-5/6 p-1'>
                  <img
                    src={comment2.profile}
                    className='rounded-full h-12 w-12'
                    alt='Profile'
                  ></img>
                  <div className='flex flex-col mb-0.5'>
                    <div className='flex flex-row items-center -mt-0.5 space-x-12'>
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
                    <div className='text-md font-regular -mt-0.5'>{comment2.comment}</div>
                  </div>
                </div>
                <div className='flex justify-center'></div>
              </div>
            ),
          )}
      </div>
      <div className='flex flex-row space-x-2 -mt-2 items-center'>
        <div className='w-full'>
          {/* <MainComment id={post.id} username={username}></MainComment> */}
          <div className='flex flex-col items-center -mt-3 relative'>
            {emoji && (
              <div className='flex flex-row justify-end absolute right-0 border border-gray-400 rounded-md  3rounded-xl bottom-full '>
                <EmojiPicker height={400} width={300} onEmojiClick={handleEmojiClick}></EmojiPicker>
              </div>
            )}
            {replyid !== -1 && (
              <div
                key={replycomment[0].comment_id}
                className='bg-stone-50 p-1.5 border w-[98%] mr-1 mb-1 rounded-md shadow-sm text-sky-950 items-center'
                // style={{ width: 'max-content' }}
              >
                {console.log(replycomment)}
                <div className='flex items-center space-x-2 max-w-5/6'>
                  <img
                    src={map.get(replycomment[0].comment_id).profile}
                    className='rounded-full h-12 w-12'
                  ></img>
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
                  className='h-4 w-4 absolute -top-3 right-0'
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
      <div className='flex flex-row h-11 w-full mt-2 py-1 items-center'>
        <img src={`data:image/png;base64,${imageURL}`} className='h-10 w-10 rounded-full mr-2' />
        <input
          class='flex h-11 placeholder:text-stone-500 w-full rounded-md border bg-stone-50 border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 flex-1'
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

export default Comments;
