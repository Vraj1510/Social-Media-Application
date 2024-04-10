import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import zoom from '../Images/zoom.png';
import phone from '../Images/phone.png';
import RoundedBtn from './RoundButton';
import { BiHappy } from 'react-icons/bi';
import { AiOutlinePaperClip } from 'react-icons/ai';
import { IoSend } from 'react-icons/io5';
import more1 from '../Images/more1.png';
import remove from '../Images/remove.png';
import more2 from '../Images/more2.png';
import EmojiPicker from 'emoji-picker-react';
import { socket } from './DashBoard';
import logout1 from '../Images/logout.png';
import PostDisplay from './PostDisplay';
// const socket = io.connect('http://localhost:3001');

const Chat = ({ username, chats, index1, onlineUsers1 }) => {
  const monthdata = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const daydata = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const inputRef = useRef(null);
  const fileInput = useRef(null);
  const [imagetext, setImageText] = useState(false);
  const [file, setFile] = useState('');
  const [emoji, openemoji] = useState(false);
  const [message, setmessage] = useState('');
  const [messages, setmessages] = useState([]);
  const [unseen, setunseen] = useState(false);
  const [reply, setreplyid] = useState(-1);
  const [messageReceived, setMessageReceived] = useState('');
  const [room, setRoom] = useState(0);
  const [messagesByDay, setMessagesByDay] = useState(new Map());
  const [typing, setTyping] = useState(false);
  const [typing1, setTyping1] = useState(false);
  const [moreid, openmore] = useState(-1);
  const [texts, maptexts] = useState(new Map());
  const [delete1, setdelete1] = useState(-1);
  const [delete2, setdelete2] = useState(-1);
  const [edit, setedit] = useState(-1);
  const [edited, setedited] = useState('');
  const [posts, mapPosts] = useState(new Map());
  var map1 = new Map();
  console.log(chats);
  console.log(onlineUsers1);
  const [onlineUsers, setOnlineUsers] = useState(onlineUsers1);
  console.log(onlineUsers);
  const fetchpostbyid = async (id) => {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    console.log(id);
    const raw = JSON.stringify({
      id,
    });

    const requestOptions = {
      method: 'PUT',
      headers: myHeaders,
      body: raw,
    };

    const response = await fetch('http://localhost:3001/fetchpostuserbyid', requestOptions);
    const result = await response.json();
    console.log(result.post);
    console.log(result.data);
    result.post.user_name = result.data.user_name;
    posts.set(id, result.post);
    console.log(posts);
  };
  const getTexts = async (room) => {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    var raw = JSON.stringify({
      room,
    });

    var requestOptions = {
      method: 'PUT',
      headers: myHeaders,
      body: raw,
    };
    const response1 = await fetch('http://localhost:3001/getmessages', requestOptions);
    const response = await response1.json();
    setmessages([...response.data]);
    const messagesByDay1 = new Map();
    console.log(response.data);
    response.data.sort((a, b) => {
      // Compare year
      if (a.year !== b.year) {
        return a.year - b.year;
      }
      // Compare month
      if (a.month !== b.month) {
        return a.month - b.month;
      }
      // Compare date
      if (a.date !== b.date) {
        return a.date - b.date;
      }
      // Compare hours
      if (a.hour !== b.hour) {
        return a.hour - b.hour;
      }
      // Compare minutes
      if (a.minutes !== b.minutes) {
        return a.minutes - b.minutes;
      }
      // If all are equal, maintain the order
      return 0;
    });
    await response.data.forEach(async (message) => {
      map1.set(message.id, message);
      const { day, date, month, year } = message;
      const keyArray = [year, month, date, day];
      const dayKey = keyArray.join('-');
      if (!messagesByDay1.has(dayKey)) {
        messagesByDay1.set(dayKey, []);
      }
      if (message.post_id > 0) {
        await fetchpostbyid(message.post_id);
      }
      const formattedMessage = {
        user1: message.user1,
        user2: message.user2,
        message: message.message,
        room: message.room,
        minutes: message.minutes,
        hours: message.hour,
        day: message.day,
        date: message.date,
        month: message.month,
        year: message.year,
        ampm: message.ampm,
        seen1: message.seen1,
        seen2: message.seen2,
        id: message.id,
        replyid: message.type,
        delete1: message.delete1,
        delete2: message.delete2,
        edited: message.edited,
        post_id: message.post_id,
        image_path: message.image_path,
      };
      messagesByDay1.get(dayKey).push(formattedMessage);
    });
    setMessagesByDay(messagesByDay1);
    maptexts(map1);
  };
  const handleKeyPress = async (e) => {
    if (e.key === 'Enter') {
      console.log(message);
      console.log(room);
      await insertmessage({ user1: username, user2: chats[index1].username, message, room });
      try {
        socket.connect();
        socket.emit('send_message', chats[index1].username);
      } catch (error) {
        console.log(error);
      }
      setmessage('');
      setreplyid(-1);
    }
  };
  const insert = async () => {
    console.log(message);
    console.log(room);
    await insertmessage({ user1: username, user2: chats[index1].username, message, room });
    try {
      socket.connect();
      socket.emit('send_message', chats[index1].username);
    } catch (error) {
      console.log(error);
    }
    setmessage('');
    setreplyid(-1);
  };

  const handleEmojiClick = (event) => {
    console.log(event.emoji);
    setmessage((prevInput) => prevInput + event.emoji);
  };
  const joinRoom = () => {
    socket.emit('join_room', room);
    console.log(room);
  };
  const insertmessage = async ({ user1, user2, message, room }) => {
    try {
      var formData = new FormData();
      formData.append('user1', user1);
      formData.append('user2', user2);
      formData.append('message', message);
      formData.append('room', chats[index1].id); // Assuming 'chats' and 'index1' are defined elsewhere
      var date = new Date();
      formData.append('minutes', date.getMinutes() % 60);
      formData.append('hours', date.getHours() % 60);
      formData.append('day', date.getDay());
      formData.append('date', date.getDate());
      formData.append('month', date.getMonth());
      formData.append('year', date.getFullYear());
      formData.append('reply', reply);
      var ampm = date.getHours() > 12 ? 'PM' : 'AM';
      formData.append('ampm', ampm);
      formData.append('file', file); // Make sure 'file' contains the file data

      // Log form data entries for debugging
      for (const [name, value] of formData.entries()) {
        console.log(`${name}: ${value}`);
      }

      var requestOptions = {
        method: 'POST',
        // headers: {
        //   // Set the Content-Type header to multipart/form-data
        //   'Content-Type': 'multipart/form-data',
        // },
        body: formData,
      };

      const response = await fetch('http://localhost:3001/insertmessage', requestOptions);
      const result = await response.json();
      var raw1 = {
        user1,
        user2,
        message,
        room: chats[index1].id,
        minutes: String(date.getMinutes() % 60),
        hours: String(date.getHours() % 60),
        day: String(date.getDay()),
        date: String(date.getDate()),
        month: String(date.getMonth()),
        year: String(date.getFullYear()),
        ampm,
        seen1: 'yes',
        seen2: 'no',
        id: result.messageId,
        replyid: String(reply),
        delete1: 'no',
        delete2: 'no',
        edited: 'no',
      };

      // Update state or perform other actions as needed
      console.log(raw1); // Log the constructed data object
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    formattchats();
  }, [messages]);
  const formattchats = async () => {
    const messagesByDay1 = new Map();
    console.log(messages);
    messages.sort((a, b) => {
      // Compare year
      if (a.year !== b.year) {
        return a.year - b.year;
      }
      // Compare month
      if (a.month !== b.month) {
        return a.month - b.month;
      }
      // Compare date
      if (a.date !== b.date) {
        return a.date - b.date;
      }
      // Compare hours
      if (a.hour !== b.hour) {
        return a.hour - b.hour;
      }
      // Compare minutes
      if (a.minutes !== b.minutes) {
        return a.minutes - b.minutes;
      }
      // If all are equal, maintain the order
      return 0;
    });
    messages.forEach((message) => {
      map1.set(message.id, message);
      const { day, date, month, year } = message;
      const keyArray = [year, month, date, day];
      const dayKey = keyArray.join('-');
      if (!messagesByDay1.has(dayKey)) {
        messagesByDay1.set(dayKey, []);
      }
      const formattedMessage = {
        user1: message.user1,
        user2: message.user2,
        message: message.message,
        room: message.room,
        minutes: message.minutes,
        hours: message.hour,
        day: message.day,
        date: message.date,
        month: message.month,
        year: message.year,
        ampm: message.ampm,
        seen1: message.seen1,
        seen2: message.seen2,
        id: message.id,
        replyid: message.type,
        delete1: message.delete1,
        delete2: message.delete2,
        edited: message.edited,
        post_id: message.post_id,
        image_path: message.image_path,
      };
      messagesByDay1.get(dayKey).push(formattedMessage);
    });
    setMessagesByDay(messagesByDay1);
    maptexts(map1);
  };
  const deleteforall = async (id) => {
    try {
      var myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      var raw = JSON.stringify({
        id,
      });

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
      };
      const response = await fetch('http://localhost:3001/deleteforall', requestOptions);
      await response.json();
      // await getTexts(room);
      setmessages((prevMessages) => prevMessages.filter((message) => message.id !== id));

      await formattchats();
      setdelete1(-1);
      setdelete2(-1);
      openmore(-1);
    } catch (err) {
      console.log(err.message);
    }
  };

  const deleteforme = async (id) => {
    console.log('Vraj');
    try {
      var myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      var raw = JSON.stringify({
        id,
        username,
      });

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
      };
      console.log(id);
      const response = await fetch('http://localhost:3001/deleteforme', requestOptions);
      await response.json();
      // await getTexts(room);
      setmessages((prevMessages) => prevMessages.filter((message) => message.id !== id));

      await formattchats();
      setdelete1(-1);
      setdelete2(-1);
      openmore(-1);
    } catch (err) {
      console.log(err.mesaage);
    }
  };

  const editmessage = async (id, text) => {
    console.log('Vraj');
    console.log(text);
    try {
      var myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      var raw = JSON.stringify({
        id,
        text,
      });

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
      };
      const response = await fetch('http://localhost:3001/editmessage', requestOptions);
      await response.json();

      // Update the messages array
      setmessages((prevMessages) => {
        return prevMessages.map((message) => {
          if (message.id === id) {
            // If the message id matches, update its text and set edited to true
            return { ...message, message: text, edited: 'yes' };
          } else {
            return message;
          }
        });
      });

      //  await getTexts(room);
      await formattchats();
      setedit(-1);
      openmore(-1);
      setedited('');
    } catch (err) {
      console.log(err.message);
    }
  };

  const handleInputChange = (e) => {
    setmessage(e.target.value);
    if (e.target.value.trim() !== '') {
      setTyping(true);
      try {
        socket.connect();
        socket.emit('typing');
      } catch (error) {
        console.log(error);
      }
    } else {
      setTyping(false);
    }
  };
  useEffect(() => {
    try {
      socket.connect();
      socket.emit('newUser', username);
    } catch (error) {
      console.log(error);
    }
  }, []);
  useEffect(() => {
    setOnlineUsers(onlineUsers1);
  }, [onlineUsers1, index1]);

  useEffect(() => {
    try {
      socket.connect();
      socket.on('user_online', (onlineUser) => {
        setOnlineUsers((prevOnlineUsers) => {
          const newOnlineUsers = [...new Set([...prevOnlineUsers, onlineUser])];
          return newOnlineUsers;
        });
      });
      socket.on('user_offline', (offlineUser) => {
        setOnlineUsers((prevOnlineUsers) => {
          const newOnlineUsers = prevOnlineUsers.filter((user) => user !== offlineUser);
          return newOnlineUsers;
        });
      });
      socket.on('istyping', () => {
        setTyping1(true);
      });
      return () => {
        socket.off('user_online');
        socket.off('user_offline');
      };
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    try {
      socket.connect();
      const handleReceiveMessage = async () => {
        console.log('received');
        console.log(index1);
        if (index1 !== -1) {
          await getTexts(chats[index1].id);
          await seeMessages(chats[index1].username, username);
        }
      };
      socket.on('recieve_message', async (maps1) => {
        await handleReceiveMessage();
      });
      return () => {
        socket.off('recieve_message', handleReceiveMessage);
      };
    } catch (error) {
      console.log(error);
    }
  }, [index1]);

  const seeMessages = async (user1, user2) => {
    try {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');

      const raw = JSON.stringify({
        user1,
        user2,
      });

      const requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: raw,
      };

      const response = await fetch('http://localhost:3001/seeMessages', requestOptions);
      await response.json();
    } catch (error) {
      console.error('Error fetching friend data:', error.message);
    }
  };
  const updateTextareaHeight = (event) => {
    const textarea = event.target;
    textarea.style.height = 'auto'; // Reset the height to auto to recalculate
    textarea.style.height = textarea.scrollHeight + 'px'; // Set the height to fit the content
  };
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
      if (isSmallScreen) {
      }
    };

    handleResize(); // Call it once to set initial state based on screen size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSmallScreen]);

  useEffect(() => {
    if (index1 !== -1) {
      getTexts(chats[index1].id);
      setRoom(chats[index1].id);
      joinRoom();
      seeMessages(chats[index1].username, username);
    }
  }, [index1, chats]);
  if (index1 === -1) {
    return (
      <div className='flex w-full h-full bg-orange-50 justify-around items-center'>
        <div className='text-4xl text-cyan-950'>Start A Conversation!</div>
      </div>
    );
  } else {
    joinRoom();
    return (
      <div className='w-full h-screen'>
        <div className='flex items-center justify-between px-2 bg-stone-50'>
          <div className='flex flex-row space-x-3 items-center'>
            {isSmallScreen && (
              <img
                src={logout1}
                className='h-12 bg-white border-2 border-sky-300 shadow-lg w-12'
              ></img>
            )}
            <img
              src={`data:image/png;base64,${chats[index1].profile}`}
              className='h-[50px] w-[50px] rounded-full'
            ></img>
            <div className='text-3xl'>{chats[index1].username}</div>
            {onlineUsers.some((user) => user.username === chats[index1].username) ? (
              <div>Online</div>
            ) : null}
          </div>
          <div className='flex flex-row space-x-3 p-3 items-center'>
            <img src={phone} className='h-[30px] w-[30px] rounded-full'></img>
            <img src={zoom} className='h-[40px] w-[40px] rounded-full'></img>
          </div>
        </div>
        <div className='w-full bg-gray-300 h-[2px]'></div>
        <div className='p-1 h-[83.5%] bg-orange-50 overflow-y-scroll'>
          {console.log(typeof messagesByDay)}
          {Array.from(messagesByDay).map(([key, value]) => {
            const arr1 = key.split('-');
            arr1.map((el) => {
              return parseInt(el);
            });
            const currdate = new Date();
            let time1 = '';
            if (currdate.getFullYear() === parseInt(arr1[0], 10)) {
              if (currdate.getMonth() === parseInt(arr1[1], 10)) {
                if (currdate.getDate() === parseInt(arr1[2], 10)) {
                  time1 = 'Today';
                } else {
                  if (currdate.getDate() - parseInt(arr1[2], 10) < 7) {
                    if (currdate.getDate() - parseInt(arr1[2], 10) === 1) {
                      time1 = 'Yesterday';
                    } else {
                      time1 = daydata[parseInt(arr1[3], 10)];
                    }
                  } else {
                    time1 = arr1[2] + ' ' + daydata[parseInt(arr1[3], 10)];
                  }
                }
              } else {
                time1 =
                  arr1[2] +
                  ' ' +
                  monthdata[parseInt(arr1[1], 10)] +
                  ' ' +
                  daydata[parseInt(arr1[3], 10)];
              }
            } else {
              time1 =
                arr1[2] +
                '-' +
                (parseInt(arr1[1], 10) + 1) +
                '-' +
                arr1[0] +
                ' ' +
                daydata[parseInt(arr1[3], 10)];
            }
            value.sort((a, b) => {
              // Convert hours and minutes to numbers
              const aHour = parseInt(a.hours, 10);
              const bHour = parseInt(b.hours, 10);
              const aMinute = parseInt(a.minutes, 10);
              const bMinute = parseInt(b.minutes, 10);

              // Compare hours
              if (aHour !== bHour) {
                return aHour - bHour; // Sort by hour in ascending order
              } else {
                // If hours are the same, compare minutes
                if (aMinute !== bMinute) {
                  return aMinute - bMinute; // Sort by minute in ascending order
                } else {
                  // If minutes are the same, compare seconds (assuming seconds are available in your data)
                  return parseInt(a.seconds, 10) - parseInt(b.seconds, 10); // Sort by seconds in ascending order
                }
              }
            });
            return (
              <div key={key} className='flex w-full flex-col'>
                {/* {console.log(value.length)} */}
                {/* backend/newImages */}
                <div className='flex flex-row items-center justify-between'>
                  <div className='flex-grow h-[1px] bg-gradient-to-r from-transparent to-cyan-950'></div>
                  <div className='z-10 text-cyan-950 text-lg p-3'>{time1}</div>
                  <div className='flex-grow h-[1px] bg-gradient-to-r from-cyan-950 to-transparent'></div>
                </div>
                {/* backend/newImages/airobot.png */}
                {value.map((text, index) => {
                  const isCurrentUser = text.user1 === username;
                  const minutes1 = text.minutes < 10 ? '0' + text.minutes : text.minutes;
                  const hour12 = parseInt(text.hours, 10) % 12 || 12;
                  const time = hour12 + ':' + minutes1 + ' ' + text.ampm;
                  return (
                    <div key={index} className='flex flex-row w-full items-center'>
                      {/* {console.log(text)}
                      {console.log(!isCurrentUser)}
                      {console.log(text.seen2 === 'no')}
                      {console.log(!unseen)} */}
                      {text.id === edit && (
                        <div className='fixed inset-0 flex justify-center items-center z-50 backdrop-filter backdrop-blur-sm bg-black bg-opacity-50'>
                          <div className='flex flex-col space-y-4 items-start bg-cyan-100 rounded-md py-6 px-5 w-1/3 relative'>
                            <div className='flex flex-col w-full'>
                              <textarea
                                type='text'
                                value={edited}
                                rows={1}
                                onChange={(e) => {
                                  setedited(e.target.value);
                                  updateTextareaHeight(e);
                                }}
                                className='outline-none px-2 py-1 rounded-md border-2 border-sky-300 w-full'
                              ></textarea>
                              <img
                                src={remove}
                                className='h-6 w-6 absolute -right-2 -top-2'
                                onChange={(e) => setedited(e.target.value)}
                                onClick={() => {
                                  setedit(-1);
                                  openmore(-1);
                                  setedited('');
                                }}
                              ></img>
                            </div>
                            <button
                              onClick={async () => {
                                console.log(edited);
                                console.log(text.id);
                                await editmessage(text.id, edited);
                              }}
                              className='bg-gray-200 rounded-md p-1 px-4 shadow-md border-gray-300 border-2'
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      )}
                      {text.id === delete1 && (
                        <div className='fixed inset-0 flex justify-center items-center z-50 backdrop-filter backdrop-blur-sm bg-black bg-opacity-50'>
                          <div className='flex flex-row bg-stone-50 rounded-md py-6 px-5 relative'>
                            <button
                              onClick={() => {
                                deleteforall(text.id);
                              }}
                              className='text-black drop-shadow-lg border-sky-400 border-2 mx-2 rounded-md p-2 bg-cyan-200'
                            >
                              Delete For All
                            </button>
                            <button
                              onClick={async () => {
                                await deleteforme(text.id);
                              }}
                              className='text-black drop-shadow-lg border-sky-400 border-2 rounded-md p-2 bg-cyan-200'
                            >
                              Delete For Me
                            </button>
                            <img
                              src={remove}
                              className='h-6 w-6 absolute -right-2 -top-2'
                              onClick={() => {
                                setdelete1(-1);
                                setdelete2(-1);
                                openmore(-1);
                              }}
                            ></img>
                          </div>
                        </div>
                      )}
                      {text.id === delete2 && (
                        <div className='fixed inset-0 flex justify-center items-center z-50 backdrop-filter backdrop-blur-sm bg-black bg-opacity-50'>
                          <div className='flex flex-row bg-stone-50 rounded-md py-6 px-5 relative'>
                            <button
                              onClick={async () => {
                                await deleteforme(text.id);
                              }}
                              className='text-black drop-shadow-lg border-sky-400 border-2 rounded-md p-2 bg-cyan-200'
                            >
                              Delete For Me
                            </button>
                            <img
                              src={remove}
                              className='h-6 w-6 absolute -right-2 -top-2'
                              onClick={() => {
                                setdelete1(-1);
                                setdelete2(-1);
                                openmore(-1);
                              }}
                            ></img>
                          </div>
                        </div>
                      )}
                      {!isCurrentUser && text.seen2 === 'no' && !unseen && (
                        <div className='text-md font-medium'>
                          {value.length - index} unseen messages
                        </div>
                      )}
                      {console.log(text)}
                      {/* isCurrentUser text.delete1 should be no, if not text.delete2 should be no*/}
                      {isCurrentUser
                        ? text.delete1 === 'no' && (
                            <div className='flex flex-col mr-2 rounded-md my-0.5 ml-auto bg-cyan-800'>
                              {text.replyid !== '' && texts.has(parseInt(text.replyid)) ? (
                                <div className='mx-2 border-2 border-sky-400 rounded-md shadow-md mt-2 py-1 w-11/12 px-1 text-cyan-950 text-lg bg-white'>
                                  {texts.get(parseInt(text.replyid)).message}
                                </div>
                              ) : (
                                <div></div>
                              )}
                              <div
                                className={`flex flex-row w-full ${
                                  text.post_id > 0 ? 'space-x-10 mt-1 ' : ''
                                }`}
                              >
                                {text.post_id > 0 ? (
                                  <div
                                    className={`rounded w-[120%] px-3 pb-2 pt-1.5 mb-1 -mr-1.5 text-lg text-white`}
                                  >
                                    {posts.get(text.post_id) && (
                                      <PostDisplay post={posts.get(text.post_id)}></PostDisplay>
                                    )}
                                  </div>
                                ) : text.image_path !== null ? (
                                  <div className='w-[320%]'>
                                    <img
                                      src={`data:image/png;base64,${text.image_path}`}
                                      className='w-80 h-64 py-3 px-2 pl-3 -mr-16 '
                                    ></img>
                                  </div>
                                ) : (
                                  // If neither text.post_id nor text.image_path conditions are met
                                  <div
                                    className={`rounded px-3 pb-2 pt-1.5 mb-1 -mr-1.5  text-lg text-white`}
                                  >
                                    {text.message}
                                  </div>
                                )}

                                <div className='flex flex-col items-end h-[44px] w-[80px] rounded justify-between '>
                                  {isCurrentUser && moreid === text.id && (
                                    <div className='flex flex-row bg-white px-3 space-x-3 py-1 -mt-8 border-cyan-400 rounded-md border-2'>
                                      <button
                                        className='text-sm'
                                        onClick={() => {
                                          setreplyid(text.id);
                                          openmore(-1);
                                        }}
                                      >
                                        Reply
                                      </button>
                                      <button
                                        className='text-sm'
                                        onClick={() => {
                                          setdelete1(text.id);
                                          setdelete2(-1);
                                        }}
                                      >
                                        Delete
                                      </button>
                                      {text.post_id === null && text.image_path === null && (
                                        <button
                                          className='text-sm'
                                          onClick={() => {
                                            setedit(text.id);
                                            setedited(text.message);
                                          }}
                                        >
                                          Edit
                                        </button>
                                      )}
                                    </div>
                                  )}
                                  <div className='flex flex-row'>
                                    {text.edited === 'yes' && (
                                      <div className='text-stone-200 text-sm mr-1 mt-0.5 mb-0.5'>
                                        Edited
                                      </div>
                                    )}
                                    <img
                                      src={more2}
                                      onClick={() => {
                                        console.log(text.id);
                                        moreid === -1 ? openmore(text.id) : openmore(-1);
                                      }}
                                      className='w-4 h-4 mt-1 mr-2'
                                      alt='more'
                                    ></img>
                                  </div>
                                  {!text.post_id > 0 && text.image_path === null && (
                                    <div className='text-sm text-white w-16 mb-1 '>{time}</div>
                                  )}
                                </div>
                              </div>
                              {(text.post_id > 0 || text.image_path !== null) && (
                                <div className='text-sm ml-2.5 -mt-1.5 text-white w-16 mb-1 '>
                                  {time}
                                </div>
                              )}
                            </div>
                          )
                        : text.delete2 === 'no' && (
                            <div className='flex flex-row'>
                              <div className='flex flex-col ml-2 my-1 rounded-md bg-cyan-200'>
                                {text.replyid !== '' && texts.has(parseInt(text.replyid)) ? (
                                  <div className='mx-2 border-2 border-sky-400 rounded-md shadow-md mt-2 py-1 px-1 w-11/12 text-cyan-950 text-lg bg-white'>
                                    {texts.get(parseInt(text.replyid)).message}
                                  </div>
                                ) : (
                                  <div></div>
                                )}
                                <div className='flex flex-row'>
                                  {text.post_id > 0 ? (
                                    <div
                                      className={`rounded w-[120%] px-3 pb-2 pt-3 mb-1 pr-12 -mr-1.5 text-lg text-white`}
                                    >
                                      {posts.get(text.post_id) && (
                                        <PostDisplay post={posts.get(text.post_id)}></PostDisplay>
                                      )}
                                    </div>
                                  ) : text.image_path !== null ? (
                                    <div className='w-[100%] -mr-14 px-3 pb-2 pt-3 mb-1 '>
                                      <img
                                        src={`data:image/png;base64,${text.image_path}`}
                                        className='w-64 h-64'
                                      ></img>
                                    </div>
                                  ) : (
                                    // If neither text.post_id nor text.image_path conditions are met
                                    <div
                                      className={`rounded px-3 pb-2 pt-1.5 mb-1 -mr-1.5 text-lg text-cyan-950`}
                                    >
                                      {text.message}
                                    </div>
                                  )}
                                  <div className='flex flex-col items-end mr-auto h-[44px] w-[80px] rounded justify-between'>
                                    <img
                                      src={more1}
                                      onClick={() => {
                                        console.log(text.id);
                                        moreid === -1 ? openmore(text.id) : openmore(-1);
                                      }}
                                      className='w-4 h-4 mt-1 mr-2'
                                      alt='more'
                                    ></img>
                                    {!text.post_id > 0 && text.image_path === null && (
                                      <div className='text-sm text-gray-400 w-16 mb-1 '>{time}</div>
                                    )}
                                  </div>
                                </div>
                                {(text.post_id > 0 || text.image_path !== null) && (
                                  <div className='text-sm ml-3 -mt-1.5 text-gray-500 w-16 mb-1 '>
                                    {time}
                                  </div>
                                )}
                              </div>
                              {moreid === text.id && (
                                <div className='flex flex-row bg-white px-3 h-10 mt-1 space-x-3 rounded-md border-sky-400 border-2'>
                                  <button
                                    className='text-sm'
                                    onClick={() => {
                                      setreplyid(text.id);
                                      openmore(-1);
                                    }}
                                  >
                                    Reply
                                  </button>
                                  <button
                                    className='text-sm'
                                    onClick={() => {
                                      setdelete2(text.id);
                                      setdelete1(-1);
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                    </div>
                  );
                })}
              </div>
            );
          })}
          {/* <div className='fixed inset-0 flex justify-center items-center z-50 backdrop-filter backdrop-blur-sm bg-black bg-opacity-50'></div> */}
          {emoji && (
            <EmojiPicker
              width={'400px'}
              height={'400px'}
              className='z-50 absolute -top-2/3 -bottom-96 left-0'
              onEmojiClick={handleEmojiClick}
            ></EmojiPicker>
          )}
        </div>
        <div className='w-full bg-gray-300 h-[1px]'></div>
        {console.log(texts.get(reply))}
        {reply !== -1 && (
          // <div className='fixed bottom-16 '>{texts.get(reply).message}</div>
          <div className='flex flex-row fixed bottom-16 left-92 w-8/12 ml-28'>
            <img
              src={remove}
              onClick={() => {
                setreplyid(-1);
              }}
              className='absolute -right-1 -top-3 h-6 w-6'
            ></img>
            <div
              className={`w-full py-2 rounded-md p-1 border-2 bg-cyan-600 text-white border-cyan-900 shadow-sm`}
            >
              {texts.get(reply).message}
            </div>
          </div>
        )}
        <div className='flex items-center w-full px-2 py-1'>
          <RoundedBtn
            size='30'
            onClick={() => {
              openemoji(!emoji);
            }}
            icon={<BiHappy />}
          />
          <span className='mr-2 '>
            <RoundedBtn
              size='32'
              onClick={() => {
                fileInput.current.click();
                setImageText(true);
              }}
              icon={<AiOutlinePaperClip />}
            ></RoundedBtn>
            <input
              type='file'
              ref={fileInput}
              style={{ display: 'none' }}
              multiple
              onChange={(event) => {
                setFile(event.target.files[0]);
                console.log(file.size);
              }}
            />
          </span>
          {imagetext && file.size > 0 && (
            <div className='fixed inset-0 flex justify-center items-center z-50 backdrop-filter backdrop-blur-sm bg-black bg-opacity-50'>
              <div className='flex space-y-4 items-start bg-cyan-100 border-4 border-cyan-600 rounded-md py-6 px-5 w-1/3 justify-between relative'>
                <div className='flex flex-col w-full'>
                  {file && <img src={URL.createObjectURL(file)} className='h-auto w-full'></img>}{' '}
                  <div className='flex w-full items-center'>
                    <input
                      type='text'
                      className='w-[100%] outline-none mt-4 text-lg p-1 rounded-md border-2 border-orange-300 shadow-md'
                    ></input>
                    <IoSend
                      onClick={async () => {
                        await insert();
                        setImageText(false);
                      }}
                      size={24}
                      className='text-[#52575b] -ml-8 mt-3 focus:outline-none'
                    ></IoSend>
                  </div>
                </div>
                <img
                  src={remove}
                  className='absolute -top-7 -right-3 h-6 w-6'
                  onClick={() => {
                    setImageText(false);
                  }}
                ></img>
              </div>
            </div>
          )}
          <input
            type='text'
            placeholder='Type a message'
            className='bg-gray-200 rounded-lg outline-none text-lg text-cyan-950 w-[1200px] h-[45px] px-3 placeholder:text-lg placeholder:text-gray-600'
            style={{ fontSize: '1.5em' }} // Adjust the '2em' value based on your preference
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            ref={inputRef}
            value={message}
          />
        </div>
      </div>
    );
  }
};

export default Chat;
