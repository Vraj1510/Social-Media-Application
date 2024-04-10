import React from 'react';
import followingimg from '../Images/following.png';
import followersimg from '../Images/followers.png';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import search from '../Images/search.png';
import profile from '../Images/profile3.png';
import home from '../Images/home.svg';
import logoImg from '../Images/logo.jpeg';
import Notifications from './Notifications';
import Following from './Following';
import Followers from './Followers';
import io from 'socket.io-client';
import img1 from '../Images/profile1.png';
import logout1 from '../Images/logout.png';
import DashBoardPosts from './DashboardPosts';
import PYMK from './PYMK';
import { socket } from './DashBoard';
import { useIndex } from './IndexContext';

// const socket = io.connect('http://localhost:3001', { autoConnect: false });
function Sidebar() {
  console.log(socket);
  // console.log(username);
  const navigate = useNavigate();
  const { updateIndex } = useIndex();
  const { state } = useLocation();
  const { username } = useIndex();
  const [input, setInput] = useState('');
  const [list, setList] = useState([]);
  // const [index, setindex] = useState(index);
  const { index } = useIndex();
  console.log(index);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupOpenf, setIsPopupOpenf] = useState(false);
  const [isPopupOpenn, setIsPopupOpenn] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [imageUrl, setImageUrl] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [chatcount, setchatcount] = useState(0);
  const navigate3 = useNavigate();
  const navigateToDashboard = (state) => {
    navigate3('/app', state);
  };
  useEffect(() => {
    if (index === 2) {
      seenotifications();
      setCount(0);
    }
  });
  useEffect(() => {
    socket.connect();
    console.log(socket.id);
    socket.on('recieve_message', async (maps1) => {
      console.log('recieved message on dashboard');
      console.log(maps1.length);
      await fetchunseen();
    });
    socket.on('notifCount', async (count) => {
      console.log(count);
      console.log('recieved');
      console.log(index);
      setCount(count);
      if (index === 2) {
        console.log('seenotif as user in in notif');
        await seenotifications();
        setCount(0);
      }
    });
  }, []);
  useEffect(() => {
    socket.connect();
    socket.emit('newUser', username);
    console.log(onlineUsers);
  }, []);

  useEffect(() => {
    socket.connect();
    socket.on('user_online', (onlineUser) => {
      setOnlineUsers([...onlineUser]);
    });
    socket.on('user_offline', (onlineUser) => {
      setOnlineUsers([...onlineUser]);
    });
    console.log(onlineUsers);
    return () => {
      socket.off('user_online');
      socket.off('user_offline');
    };
  }, [socket, username]);

  useEffect(() => {
    fetchData();
    fetchunseen();
    updateIndex(index);
  }, [username]);
  const fetchunseen = async () => {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    var raw = JSON.stringify({
      username,
    });

    var requestOptions = {
      method: 'PUT',
      headers: myHeaders,
      body: raw,
    };
    const response1 = await fetch('http://localhost:3001/fetchunseen', requestOptions);
    const response = await response1.json();
    var count = 0;
    console.log(response.data);
    response.data.map((data1) => {
      if (data1[1] > 0) {
        count++;
      }
    });
    setchatcount(count);
    console.log(count);
  };
  const logout = async () => {
    try {
      const response = await fetch('http://localhost:3001/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      const result = await response.json();
      console.log(result);
      if (result.message) {
        socket.disconnect();
        navigate('/auth');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleChange = (value) => {
    setInput(value);
    const filteredUsers = list.filter((user) =>
      user.user_name.toLowerCase().includes(value.toLowerCase()),
    );
    setFilteredUsers(filteredUsers);
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
      setImageUrl(result.imageContent);
    } catch (err) {
      console.error('Error fetching image:', err.message);
    }
  };

  const seenotifications = async () => {
    try {
      console.log('seen');
      const body = { username };
      const response = await fetch('http://localhost:3001/seenNotifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      await response.json();
      if (!response.ok) {
        console.error('API request failed with status:', response.status);
        return;
      }
      setCount(0);
    } catch (err) {
      console.error('Error fetching image:', err.message);
    }
  };
  const fetchData = async (value) => {
    await fetch('http://localhost:3001/fetch1')
      .then((response) => response.json())
      .then((json) => {
        console.log('Type of json:', typeof json);
        console.log('json:', json);
        setList([...json]);
        setFilteredUsers([...json]);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };
  const notifcount = async () => {
    const body = { username };
    const response = await fetch('http://localhost:3001/fetchnotifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('API request failed with status:', response.status);
      return;
    }
    const responseData = await response.json();
    var count1 = count;
    responseData.map((not) => {
      if (
        (not.person1 === username && not.seen1 === 'no') ||
        (not.person2 === username && not.seen2 === 'no')
      ) {
        count1++;
      }
    });
    setCount(count1);
  };
  const navigatetoprofile = (state) => {
    navigate('/app/profile', state);
  };
  const navigatetologin = () => {
    navigate('/auth');
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
  const navigate1 = useNavigate();
  const navigatetoprofile1 = (state) => {
    var user2 = state.usernames;
    console.log(user2);
    console.log(username);
    if (user2[0] === username) {
      navigate1('/app/profile', { state: { username } });
    } else {
      navigate1('/app/profile1', { state: { usernames: [user2, username] } });
    }
  };
  const navigate2 = useNavigate();
  const navigatetochat = async () => {
    await fetchunseen();
    navigate2('/app/chathome', { state: { username, onlineUsers } });
  };
  console.log(index);
  useEffect(() => {
    fetchProfileImage();
    fetchData();
    notifcount();
    fetchunseen();
  }, [username]);
  console.log(index);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth > 768);
      if (isLargeScreen) {
        updateIndex(index);
        updateIndex(index);
      }
    };

    handleResize(); // Call it once to set initial state based on screen size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [index, isLargeScreen]);
  if ((index === 0 || index === 1) && isLargeScreen) {
    return (
      <div className='flex flex-col mb-4 mt-2 lg:h-[45rem] border-2 border-orange-200 shadow-2xl items-center space-y-1 mx-2 p-7 px-5 bg-orange-50 rounded-lg'>
        <div className='flex flex-col items-center space-y-2 mb-8'>
          <img
            src={`data:image/png;base64,${imageUrl}`}
            className='rounded-full w-[90px] h-[90px]'
          ></img>
          <div className='flex flex-col text-4xl items-center'>{username}</div>
        </div>
        <div className='flex flex-col w-full'>
          <div
            onClick={() => {
              updateIndex(0);
              navigateToDashboard({ state: { username } });
            }}
            className={`flex flex-col cursor-pointer ${
              index === 0 ? 'bg-orange-100' : ''
            } hover:bg-orange-100 pt-2`}
          >
            <div className='flex flex-row ml-2 items-center mb-1 space-x-6'>
              <img src={home} className='w-11 h-11 rounded-full'></img>
              <div className='text-xl mt-2 hover:underline hover:underline-cyan-800 hover:text-cyan-800 hover:underline-offset-2'>
                Home
              </div>
            </div>
            <div className='h-[2px] bg-gray-300 w-full '></div>
          </div>

          <div
            onClick={() => {
              updateIndex(1);
              navigatetoprofile({ state: { username } });
            }}
            className={`flex flex-col cursor-pointer ${
              index === 1 ? 'bg-orange-100' : ''
            } hover:bg-orange-100 pt-2 `}
          >
            <div className='flex flex-row items-center mb-1 ml-2 space-x-7'>
              <img src={profile} className='w-10 h-10 rounded-full'></img>
              <div className='text-xl mt-1 hover:underline hover:underline-cyan-800 hover:text-cyan-800 hover:underline-offset-2'>
                Profile
              </div>
            </div>
            <div className='h-[2px] bg-gray-300 w-full '></div>
          </div>
          <div
            onClick={async () => {
              updateIndex(2);
              await seenotifications();
            }}
            className='flex flex-col cursor-pointer hover:bg-orange-100 pt-3'
          >
            <div className='flex flex-row items-center -mt-2 -mb-2 ml-2 space-x-7'>
              <div className='relative items-center'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='#083344'
                  className='w-10 h-16 rounded-full'
                  style={{ zIndex: 1 }}
                >
                  <path
                    fillRule='evenodd'
                    d='M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z'
                    clipRule='evenodd'
                  />
                </svg>
                {count > 0 && index !== 2 && (
                  <div
                    className='absolute top-0 left-0 rounded-full bg-red-700 mx-3 ml-4 -mb-3 px-1.5 text-sm text-white'
                    style={{ zIndex: 10 }}
                  >
                    {count}
                  </div>
                )}
              </div>

              <div className='text-xl mt-1 hover:underline hover:underline-cyan-800 hover:text-cyan-800  hover:underline-offset-2'>
                Notifications
              </div>
            </div>
            <div className='h-[2px] bg-gray-300 w-full '></div>
          </div>

          <div
            onClick={() => {
              updateIndex(3);
              updateIndex(3);
            }}
            className='flex flex-col cursor-pointer hover:bg-orange-100 pt-1'
          >
            <div className='flex flex-row items-center mb-1 ml-2 space-x-6'>
              <img src={followersimg} className='w-11 h-11 mt-2 rounded-full'></img>
              <div className='text-xl mt-4 hover:underline hover:underline-cyan-800 hover:text-cyan-800 hover:underline-offset-2'>
                Followers
              </div>
            </div>
            <div className='h-[2px] bg-gray-300 w-full '></div>
          </div>
          <div
            onClick={() => {
              updateIndex(4);
              updateIndex(4);
            }}
            className='flex flex-col cursor-pointer hover:bg-orange-100 pt-1'
          >
            <div className='flex flex-row items-center mb-1 ml-2 space-x-6'>
              <img src={followingimg} className='w-11 h-11 mt-2 rounded-full'></img>
              <div className='text-xl mt-4 hover:underline hover:underline-cyan-800 hover:text-cyan-800 hover:underline-offset-2'>
                Following
              </div>
            </div>
            <div className='h-[2px] bg-gray-300 w-full '></div>
          </div>

          <div
            onClick={() => {
              updateIndex(5);
              updateIndex(5);
            }}
            className='flex flex-col cursor-pointer hover:bg-orange-100 pt-1'
          >
            <div className='flex flex-row items-center mb-1 ml-2 space-x-6'>
              <img src={search} className='w-11 h-11 mt-2 rounded-full'></img>
              <div className='text-xl mt-4 hover:underline hover:underline-cyan-800 hover:text-cyan-800 hover:underline-offset-2'>
                Search
              </div>
            </div>
            <div className='h-[2px] bg-gray-300 w-full '></div>
          </div>
          <div className='flex flex-col cursor-pointer hover:bg-orange-100 pt-1'>
            <div className='flex flex-row items-center mb-1 ml-2 space-x-6'>
              <div className='relative items-center'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='#083344'
                  className='w-11 h-11 mt-2 rounded-full'
                  onClick={() => navigatetochat()}
                >
                  <path
                    fillRule='evenodd'
                    d='M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z'
                    clipRule='evenodd'
                  />
                </svg>
                {chatcount > 0 && (
                  <div
                    className='absolute top-0 left-2 rounded-full bg-red-700 mx-3 ml-4 -mb-3 px-1.5 text-sm text-white'
                    style={{ zIndex: 10 }}
                  >
                    {chatcount}
                  </div>
                )}
              </div>
              <div className='text-xl mt-4 hover:underline hover:underline-cyan-800 hover:text-cyan-800 hover:underline-offset-2'>
                Chat
              </div>
            </div>
            <div className='h-[2px] bg-gray-300 w-full '></div>
          </div>
        </div>
        <div className='flex flex-col -ml-1 w-full items-center'>
          <button
            onClick={async () => {
              await logout();
            }}
            className='bg-cyan-800 text-white mt-6 text-lg w-5/6 py-2 rounded-xl'
          >
            Logout
          </button>
          {/* <div className='h-[2px] bg-gray-300 w-full '></div> */}
        </div>
      </div>
    );
  } else {
    // console.log(index);
    // console.log(isSmallScreen);
    return (
      <div className={`${isSmallScreen && index >= 2 ? 'h-screen' : ''}`}>
        <div
          className={`flex ${isSmallScreen ? 'flex-col' : 'flex-row'} ${
            index >= 2 ? 'h-full' : 'h-auto'
          } lg:my-2 md:mt-0 lg:mt-1 lg:-mb-0.5 md:-mb-0 lg:ml-1.5 md:my-1 md:ml-0.5`}
        >
          {isSmallScreen && (
            <div className={`w-screen ${index >= 2 ? 'h-[92.5%]' : ''}`}>
              {index === 2 && isSmallScreen && (
                <div className='w-[97%] h-full'>
                  <div className='ml-1.5 mt-0.5 w-full bg-orange-50 h-[100%] border-2 border-orange-200 pr-4 rounded-md'>
                    <div className='flex flex-col h-full items-start relative -mr-4 mb-2 w-full'>
                      <div className='ml-5 mt-7 text-3xl text-cyan-950'>Notifications</div>
                      <Notifications username={username}></Notifications>
                    </div>
                  </div>
                </div>
              )}
              {index === 3 && isSmallScreen && (
                <div className='w-[97%] h-full'>
                  <div className='ml-1.5 mt-0.5 w-full bg-orange-50 h-[100%] border-2 border-orange-200 pr-4 rounded-md'>
                    <div className='flex flex-col h-full items-start relative -mr-4 mb-2 w-full'>
                      <div className='ml-5 mt-7 text-3xl text-cyan-950'>Followers</div>
                      <Following username={username}></Following>
                    </div>
                  </div>
                </div>
              )}
              {index === 4 && isSmallScreen && (
                <div className='w-[97%] h-full' style={{ height: '100%' }}>
                  <div className='ml-1.5 mt-0.5 w-full bg-orange-50 h-[100%] border-2 border-orange-200 pr-4 rounded-md'>
                    <div className='flex flex-col h-full items-start relative -mr-4 mb-2 w-full'>
                      <div className='ml-5 mt-7 text-3xl text-cyan-950'>Following</div>
                      <Followers username={username}></Followers>
                    </div>
                  </div>
                </div>
              )}
              {index === 5 && isSmallScreen && (
                <div className='w-[97%] mt-0.5 h-full' style={{ height: '100%' }}>
                  <div className='ml-1.5 w-full bg-orange-50 h-[100%] border-2 border-orange-200 pr-4 rounded-md'>
                    <div className='flex flex-col h-full items-start space-y-3 relative -mr-4 mb-2 w-full'>
                      <div className='ml-5 mt-7 text-3xl text-cyan-950'>Explore</div>
                      <input
                        type='text'
                        className='rounded-md border-2 border-sky-300 w-[92%] ml-5 bg-white text-lg py-2 px-2 mr-4 placeholder-black outline-none '
                        placeholder='Search..'
                        value={input}
                        onChange={(e) => handleChange(e.target.value)}
                      />
                      <ul className='rounded-md w-[94%] ml-5 space-y-4'>
                        <div className='flex flex-col overflow-y-scroll space-y-2 mr-2'>
                          {console.log(list)}
                          {(input === '' ? list : filteredUsers).map((user) => (
                            <li
                              key={user.user_name}
                              onClick={() =>
                                navigatetoprofile1({ usernames: [user.user_name, username] })
                              }
                              className='flex flex-row bg-white w-full border-2 border-sky-300 shadow-sm rounded-md cursor-pointer py-1.5 px-2 space-x-2'
                            >
                              <img
                                src={`data:image/png;base64,${user.profile}`}
                                className='h-[3rem] w-[3rem] rounded-full'
                                alt={user.user_name}
                              />
                              <div className='text py-3'>{user.user_name}</div>
                            </li>
                          ))}
                        </div>
                        <div className='w-full h-[2px] bg-gray-300'></div>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div
            className={`flex${isSmallScreen ? 'h-[3rem] w-[97%] ml-1.5' : ''} ${
              isSmallScreen && index >= 2 ? 'absolute bottom-1 left-0 h-[3rem] mt-1.5' : ''
            } flex-col md:px-1.5 lg:px-3 py-2 md:-mb-0 lg:mt-1 md:w-auto lg:w-auto md:mt-1 md:h-[99%] lg:h-[45rem] border-2 border-orange-200 shadow-md items-center lg:space-y-12 md:space-y-12 bg-orange-50 rounded-md `}
          >
            {!isSmallScreen && (
              <div className='flex flex-col lg:mt-4 md:mt-4 items-center'>
                <img
                  src={`data:image/png;base64,${imageUrl}`}
                  className='rounded-full md:w-14 md:h-14 lg:w-full lg:h-12 w-9 h-8'
                ></img>
              </div>
            )}
            <div
              className={`flex ${
                isSmallScreen ? 'flex-row h-full' : 'flex-col'
              } items-center justify-between lg:gap-4 md:gap-4 w-full`}
            >
              <div
                onClick={() => {
                  navigateToDashboard({ state: { username } });
                  updateIndex(0);
                  updateIndex(0);
                }}
                className={`flex flex-col justify-center items-center cursor-pointer ${
                  index === 0 ? 'bg-orange-100' : ''
                } hover:bg-orange-100 md:w-12 h:w-12 w-10 lg:pt-2 md:pt-2`}
              >
                <img
                  src={home}
                  className=' md:w-10 md:h-10 lg:w-10 lg:h-10 w-[1.7rem] h-[1.7rem] rounded-full'
                ></img>
                <div className='h-[2px] bg-gray-300 sm:w-12 md:w-12 h:w-12 w-9'></div>
              </div>

              <div
                onClick={() => {
                  navigatetoprofile({ state: { username } });
                  updateIndex(1);
                  updateIndex(1);
                }}
                className={`flex flex-col items-center cursor-pointer ${
                  index === 1 ? 'bg-orange-100' : ''
                } hover:bg-orange-100 md:w-12 h:w-12 w-10 lg:pt-3 md:pt-3`}
              >
                <img
                  src={profile}
                  className='md:w-10 md:h-10 lg:w-10 lg:h-10 w-[1.7rem] h-[1.7rem] rounded-full'
                ></img>
                <div className='h-[2px] bg-gray-300 md:w-12 h:w-12 w-9'></div>
              </div>
              <div
                onClick={async () => {
                  updateIndex(2);
                  updateIndex(2);
                  await seenotifications();
                }}
                className={`flex flex-col items-center cursor-pointer ${
                  index === 2 ? 'bg-orange-100' : ''
                } hover:bg-orange-100 md:w-12 h:w-12 w-10 lg:pt-2 md:pt-2`}
              >
                <div className='relative items-center'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='#083344'
                    className=' md:w-10 md:h-10 lg:w-10 lg:h-10 w-[1.7rem] h-[1.7rem] rounded-full'
                    style={{ zIndex: 1 }}
                  >
                    <path
                      fillRule='evenodd'
                      d='M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                  {count > 0 && index !== 2 && (
                    <div
                      className='absolute top-0 left-0 rounded-full bg-red-700 mx-3 ml-4 -mb-3 px-1.5 text-sm text-white'
                      style={{ zIndex: 10 }}
                    >
                      {count}
                    </div>
                  )}
                </div>
                <div className='h-[2px] bg-gray-300 md:w-12 h:w-12 w-9'></div>
              </div>

              <div
                onClick={() => {
                  updateIndex(3);
                  updateIndex(3);
                }}
                className={`flex flex-col items-center cursor-pointer ${
                  index === 3 ? 'bg-orange-100' : ''
                } hover:bg-orange-100 md:w-12 h:w-12 w-10 lg:pt-2 md:pt-2`}
              >
                <img
                  src={followersimg}
                  className=' md:w-10 md:h-10 lg:w-10 lg:h-10 w-[1.7rem] h-[1.7rem] rounded-full'
                ></img>
                <div className='h-[2px] bg-gray-300 md:w-12 h:w-12 w-9'></div>
              </div>
              <div
                onClick={() => {
                  updateIndex(4);
                  updateIndex(4);
                }}
                className={`flex flex-col items-center ${
                  index === 4 ? 'bg-orange-100' : ''
                } cursor-pointer hover:bg-orange-100 md:w-12 h:w-12 w-10 lg:pt-2 md:pt-2`}
              >
                <img
                  src={followingimg}
                  className='md:w-10 md:h-10 lg:w-10 lg:h-10 w-[1.7rem] h-[1.7rem] rounded-full'
                ></img>
                <div className='h-[2px] bg-gray-300 md:w-12 h:w-12 w-9'></div>
              </div>

              <div
                onClick={() => {
                  updateIndex(5);
                  updateIndex(5);
                }}
                className={`flex flex-col items-center ${
                  index === 5 ? 'bg-orange-100' : ''
                } cursor-pointer hover:bg-orange-100 md:w-12 h:w-12 w-10 lg:pt-2 md:pt-2`}
              >
                <img
                  src={search}
                  className='md:w-10 md:h-10 lg:w-10 lg:h-10 w-7 h-7 rounded-full'
                ></img>

                <div className='h-[2px] bg-gray-300 md:w-12 h:w-12 w-9'></div>
              </div>
              <div className='flex flex-col cursor-pointer items-center hover:bg-orange-100 lg:pt-2 md:pt-2'>
                <div className='relative items-center'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='#083344'
                    className='md:w-10 md:h-10 lg:w-10 lg:h-10 w-7 h-7 rounded-full'
                    onClick={() => navigatetochat()}
                  >
                    <path
                      fillRule='evenodd'
                      d='M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z'
                      clipRule='evenodd'
                    />
                  </svg>
                  {/* { */}
                  {chatcount > 0 && (
                    <div
                      className='absolute -top-2 left-2 rounded-full bg-red-700 mx-3 ml-4 -mb-3 px-1.5 text-sm text-white'
                      style={{ zIndex: 10 }}
                    >
                      {chatcount}
                    </div>
                  )}
                </div>
                {/* )} */}
                <div className='h-[2px] bg-gray-300 md:w-12 h:w-12 w-9'></div>
              </div>
              {!isSmallScreen && (
                <div className='flex flex-col space-y-2.5 mt-2'>
                  <img
                    onClick={() => {
                      logout();
                    }}
                    src={logout1}
                    className='sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-12 lg:h-12 w-10 h-10 text-white text-md -ml-1 mt-10 rounded-xl'
                  ></img>
                  <div className='h-[2px] bg-gray-300 w-full'></div>
                </div>
              )}
            </div>
          </div>
          {!isSmallScreen && (
            <div className='lg:w-auto h-auto lg:h-[46rem] lg:-ml-1'>
              {index === 2 && !isSmallScreen && (
                <div className='lg:w-[90%] w-screen h-full'>
                  <div className='bg-orange-50 lg:h-[98%] md:h-[98.7%] lg:w-full h-[89%] lg:mt-1 md:mt-1 border-2 border-orange-200 md:w-[89%] w-[79%] pr-4 rounded-md lg:px-2'>
                    <div className='flex flex-col items-start lg:w-[22rem] h-full w-full relative mr-2'>
                      <div className='ml-2 mt-7 text-3xl text-cyan-950'>Notifications</div>
                      <Notifications username={username}></Notifications>
                    </div>
                  </div>
                </div>
              )}
              {index === 3 && !isSmallScreen && (
                <div className='lg:w-[90%] w-screen h-full'>
                  <div className='bg-orange-50 lg:h-[98%] md:h-[98.7%] lg:w-full h-[89%] lg:mt-1 md:mt-1 border-2 border-orange-200 md:w-[89%] w-[79%] pr-4 rounded-md lg:px-2'>
                    <div className='flex flex-col items-start lg:w-[22rem] h-full w-full relative mr-2'>
                      <div className='ml-2 mt-7 text-3xl text-cyan-950'>Followers</div>
                      <Followers username={username}></Followers>
                    </div>
                  </div>
                </div>
              )}
              {index === 4 && !isSmallScreen && (
                <div className='lg:w-[90%] w-screen h-full'>
                  <div className='bg-orange-50 lg:h-[98%] md:h-[98.7%] lg:w-full h-[89%] lg:mt-1 md:mt-1 border-2 border-orange-200 md:w-[89%] w-[79%] pr-4 rounded-md lg:px-2'>
                    <div className='flex flex-col items-start lg:w-[22rem] h-full w-full relative mr-2'>
                      <div className='ml-2 mt-7 text-3xl text-cyan-950'>Following</div>
                      <Following username={username}></Following>
                    </div>
                  </div>
                </div>
              )}
              {index === 5 && !isSmallScreen && (
                <div className='lg:w-[90%] w-screen h-full'>
                  <div className='bg-orange-50 lg:h-[98%] md:h-[98.7%] lg:w-full h-[89%] lg:mt-1 md:mt-1 border-2 border-orange-200 md:w-[89%] w-[79%] pr-4 rounded-md lg:px-2'>
                    <div className='flex flex-col items-start lg:w-[22rem] h-full w-full relative mr-2'>
                      <div className='ml-2 mt-7 mb-1 text-3xl text-cyan-950'>Explore</div>
                      <input
                        type='text'
                        className='rounded-md mb-2 border-2 border-sky-300 md:w-[102%] lg:w-[86%] w-[86%] ml-2 bg-white text-lg py-2 px-2 mr-4 placeholder-black outline-none '
                        placeholder='Search..'
                        value={input}
                        onChange={(e) => handleChange(e.target.value)}
                      />
                      <div
                        className={`lg:h-[85%] h-[85%] space-y-4 ml-2 w-[94%] lg:w-[96%] mt-4 rounded-md mr-2.5`}
                      >
                        <ul
                          className='flex flex-col flex-col-wrap w-full lg:h-full md:h-full overflow-y-scroll space-y-2 '
                          style={{ height: 'auto', maxHeight: '100%' }}
                        >
                          {console.log(list)}
                          {(input === '' ? list : filteredUsers).map((user) => (
                            <li
                              key={user.user_name}
                              onClick={() =>
                                navigatetoprofile1({ usernames: [user.user_name, username] })
                              }
                              className='flex flex-row bg-white w-[90%] border-2 border-sky-300 shadow-sm  rounded-md cursor-pointer py-1.5 px-2 space-x-2'
                            >
                              <img
                                src={`data:image/png;base64,${user.profile}`}
                                className='h-[3rem] w-[3rem] rounded-full'
                                alt={user.user_name}
                              />
                              <div className='text py-3'>{user.user_name}</div>
                            </li>
                          ))}
                        </ul>
                        <div className='w-[91%] h-[2px] bg-gray-300'></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}
export default Sidebar;