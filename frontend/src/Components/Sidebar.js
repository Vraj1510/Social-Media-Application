import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Notifications from './Notifications';
import Following from './Following';
import Followers from './Followers';
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
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [imageUrl, setImageUrl] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
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

  // const handleChange = (value) => {
  //   setInput(value);
  //   const filteredUsers = list.filter((user) =>
  //     user.user_name.toLowerCase().includes(value.toLowerCase()),
  //   );
  //   setFilteredUsers(filteredUsers);
  // };
  useEffect(() => {
    const filteredList = list.filter((follower) =>
      follower.user_name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredUsers(filteredList);
  }, [searchQuery, list]);

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
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
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
  if ((index === 0 || index === 1 || index == 6) && isLargeScreen) {
    return (
      <div className='flex items-center border rounded-md shadow-xl m-2 h-[97.5%] w-[25%] lg:w-[17%] md:w-[25%]'>
        {' '}
        <div className='space-y-10 w-full -mt-1 px-2 bg-white'>
          <div className='flex flex-col items-center h-1/6 bg-white'>
            <img
              src={`data:image/png;base64,${imageUrl}`}
              width='80'
              height='80'
              alt='Avatar'
              className='rounded-full'
              style={{ aspectRatio: '40 / 40', objectFit: 'cover' }}
            />
            <div className='font-normal mt-2 text-3xl'>{username}</div>
          </div>
          <div className='flex-1 h-3/5 overflow-auto py-2 justify-evenly'>
            <nav class='grid items-start h-5/6 mt-4 px-4 space-y-1 text-sm font-medium'>
              <a
                class={`flex items-center font-normal text-lg gap-5 hover:bg-gray-100 rounded-lg px-3 py-3 ${
                  index == 0 ? 'bg-gray-100 text-gray-950' : 'text-gray-600'
                } transition-all hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-50`}
                href='#'
                onClick={() => {
                  updateIndex(0);
                  navigateToDashboard({ state: { username } });
                }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6' // Adjust the size of the icon using tailwindcss classes
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2' // Use strokeWidth instead of stroke-width
                  strokeLinecap='round' // Use camelCase instead of kebab-case
                  strokeLinejoin='round' // Use camelCase instead of kebab-case
                >
                  <path d='m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'></path>
                  <polyline points='9 22 9 12 15 12 15 22'></polyline>
                </svg>
                <div className=''>Home</div>
              </a>
              <a
                class={`flex items-center font-normal  text-lg gap-5 hover:bg-gray-100 rounded-lg px-3 py-3 ${
                  index == 1 ? 'bg-gray-100 text-gray-950' : 'text-gray-600'
                } transition-all hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-50`}
                href='#'
                onClick={() => {
                  updateIndex(1);
                  navigatetoprofile({ state: { username } });
                }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6' // Adjust the size of the icon using tailwindcss classes
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2' // Use strokeWidth instead of stroke-width
                  strokeLinecap='round' // Use camelCase instead of kebab-case
                  strokeLinejoin='round'
                >
                  <path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'></path>
                  <circle cx='12' cy='7' r='4'></circle>
                </svg>
                <div className=''>Profile</div>
              </a>
              <a
                class='flex items-center font-normal text-lg p-2 gap-5 hover:bg-gray-100 rounded-lg px-3 py-3 text-gray-600 transition-all hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-50'
                href='#'
                onClick={async () => {
                  updateIndex(2);
                  await seenotifications();
                }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6' // Adjust the size of the icon using tailwindcss classes
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2' // Use strokeWidth instead of stroke-width
                  strokeLinecap='round' // Use camelCase instead of kebab-case
                  strokeLinejoin='round'
                >
                  <path d='M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9'></path>
                  <path d='M10.3 21a1.94 1.94 0 0 0 3.4 0'></path>
                </svg>

                <div className=''>Notifications</div>

                {
                  count > 0 && index !== 2 && (
                    <div class='whitespace-nowrap border mt-1 bg-black text-white text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full'>
                      {count}
                    </div>
                  )
                  // <div className='text-lg text-black'>{count}</div>
                }
              </a>
              <a
                class='flex items-center font-normal text-lg p-2 gap-5 hover:bg-gray-100 rounded-lg px-3 py-3 text-gray-600 transition-all hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-50'
                href='#'
                onClick={() => {
                  updateIndex(3);
                }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6' // Adjust the size of the icon using tailwindcss classes
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2' // Use strokeWidth instead of stroke-width
                  strokeLinecap='round' // Use camelCase instead of kebab-case
                  strokeLinejoin='round'
                >
                  <path d='M14 19a6 6 0 0 0-12 0'></path>
                  <circle cx='8' cy='9' r='4'></circle>
                  <path d='M22 19a6 6 0 0 0-6-6 4 4 0 1 0 0-8'></path>
                </svg>
                <div className=''>Followers</div>
              </a>
              <a
                class='flex items-center font-normal text-lg p-2 gap-5 hover:bg-gray-100 rounded-lg px-3 py-3 text-gray-600 transition-all hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-50'
                href='#'
                onClick={() => {
                  updateIndex(4);
                }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6' // Adjust the size of the icon using tailwindcss classes
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2' // Use strokeWidth instead of stroke-width
                  strokeLinecap='round' // Use camelCase instead of kebab-case
                  strokeLinejoin='round'
                >
                  <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'></path>
                  <circle cx='9' cy='7' r='4'></circle>
                  <line x1='19' x2='19' y1='8' y2='14'></line>
                  <line x1='22' x2='16' y1='11' y2='11'></line>
                </svg>
                <div className=''>Following</div>
              </a>
              <a
                class='flex items-center font-normal text-lg p-2 gap-5 hover:bg-gray-100 rounded-lg px-3 py-3 text-gray-600 transition-all hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-50'
                href='#'
                onClick={() => {
                  updateIndex(5);
                }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6' // Adjust the size of the icon using tailwindcss classes
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2' // Use strokeWidth instead of stroke-width
                  strokeLinecap='round' // Use camelCase instead of kebab-case
                  strokeLinejoin='round'
                >
                  <circle cx='11' cy='11' r='8'></circle>
                  <path d='m21 21-4.3-4.3'></path>
                </svg>
                <div className=''>Search</div>
              </a>
              <a
                class='flex items-center font-normal text-lg p-2 gap-5 hover:bg-gray-100 rounded-lg px-3 py-3 text-gray-600 transition-all hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-50'
                href='#'
                onClick={() => navigatetochat()}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6' // Adjust the size of the icon using tailwindcss classes
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2' // Use strokeWidth instead of stroke-width
                  strokeLinecap='round' // Use camelCase instead of kebab-case
                  strokeLinejoin='round'
                >
                  <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'></path>
                </svg>
                <div className=''>Chat</div>
                {chatcount > 0 && (
                  <div class='whitespace-nowrap bg-black text-white border text-sm mt-1 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full'>
                    {chatcount}
                  </div>
                )}
              </a>
            </nav>
          </div>
          <div
            onClick={async () => {
              await logout();
            }}
            class='flex text-white text-lg font-normal items-center bg-black justify-center py-2 rounded-md mx-5'
          >
            <a class='' href='#'>
              Logout
            </a>
          </div>
        </div>
        {/* <div className='h-[96%] bg-gray-300 ml-1 w-[1.5px]'></div> */}
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
          } lg:my-2 md:mt-0 lg:mt-1 lg:-mb-0.5 md:-mb-0 lg:mx-0 md:my-1 md:ml-0.5`}
        >
          {isSmallScreen && (
            <div className={`w-screen ${index >= 2 ? 'h-[94%]' : ''}`}>
              {index === 2 && isSmallScreen && (
                <div className='flex w-[105%] h-full'>
                  <div className='ml-1.5 mt-0.5 w-full h-[100%] pr-4 rounded-md'>
                    <div className='flex flex-col h-full items-start relative -mr-4 mb-2 w-full'>
                      <div className='ml-3 mt-4 text-3xl text-cyan-950'>Notifications</div>
                      <div className='w-[93%] h-[1.5px] ml-2.5 mt-1.5 bg-gray-200'></div>
                      <Notifications username={username}></Notifications>
                    </div>
                  </div>
                </div>
              )}
              {index === 3 && isSmallScreen && (
                <div className='flex w-[105%] h-full'>
                  <div className='ml-1.5 mt-0.5 w-full h-[100%] pr-4 rounded-md'>
                    <div className='flex flex-col h-full items-start relative -mr-4 mb-2 w-full'>
                      <div className='ml-3 mt-4 text-3xl text-cyan-950'>Followers</div>
                      <div className='w-[93%] h-[1.5px] ml-2.5 mt-1.5 bg-gray-200'></div>
                      <Following username={username}></Following>
                    </div>
                  </div>
                </div>
              )}
              {index === 4 && isSmallScreen && (
                <div className='flex w-[105%] h-full' style={{ height: '100%' }}>
                  <div className='ml-1.5 mt-0.5 w-full h-[100%] pr-4 rounded-md'>
                    <div className='flex flex-col h-full items-start relative -mr-4 mb-2 w-full'>
                      <div className='ml-3 mt-4 text-3xl text-cyan-950'>Following</div>
                      <div className='w-[93%] h-[1.5px] ml-2.5 mt-1.5 bg-gray-200'></div>
                      <Followers username={username}></Followers>
                    </div>
                  </div>
                </div>
              )}
              {index === 5 && isSmallScreen && (
                <div className='flex w-[105%] h-full' style={{ height: '100%' }}>
                  <div className='ml-1.5 mt-0.5 w-full h-[100%] pr-4 rounded-md'>
                    <div className='ml-2.5 mt-4 -mb-2 text-3xl text-black'>Search</div>
                    <div className='w-[93%] h-[1.5px] ml-2.5 mt-3 bg-gray-200'></div>
                    <div
                      className={`lg:h-[85%] h-[85%]  ml-2 w-[94%] lg:w-[87.5%] mt-3 rounded-md mr-2.5`}
                    >
                      <div
                        className='flex flex-col flex-col-wrap lg:h-full md:h-full overflow-y-scroll space-y-6'
                        style={{ height: 'auto', maxHeight: '100%' }}
                      >
                        <div className='flex w-full items-center space-x-1 mt-1'>
                          <input
                            className='flex h-10 w-full focus:outline-none  rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'
                            placeholder='Search'
                            type='search'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          <button className='inline-flex text-white bg-black items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-12'>
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              width='24'
                              height='24'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              className='h-4 w-4'
                            >
                              <circle cx='11' cy='11' r='8' />
                              <path d='m21 21-4.3-4.3' />
                            </svg>
                            <span className='sr-only'>Search</span>
                          </button>
                        </div>

                        <div className='space-y-2.5'>
                          {(searchQuery === '' ? list : filteredUsers).map((user) => (
                            <div className='flex flex-col'>
                              <div
                                key={user.user_name}
                                onClick={() =>
                                  navigatetoprofile1({ usernames: [user.user_name, username] })
                                }
                                className='flex flex-row w-full bg-stone-100 rounded-md p-2 items-center justify-between'
                              >
                                <div className='flex space-x-2'>
                                  <img
                                    src={`data:image/png;base64,${user.profile}`}
                                    className='h-[3rem] w-[3rem] rounded-full'
                                    alt={`${user.user_name}'s profile`}
                                  />
                                  <div className='text-lg py-3'>{user.user_name}</div>
                                </div>
                              </div>
                              <div className='w-full h-[2px] bg-gray-300'></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {isSmallScreen && index >= 2 && index < 6 && (
                <div className='w-full h-[1px] -mt-3.5 bg-gray-300'></div>
              )}
            </div>
          )}
          <div
            className={`flex${isSmallScreen ? 'h-[3rem] w-[97%] ml-1.5' : ''} ${
              isSmallScreen && index >= 2
                ? 'flex items-center absolute bottom-4 left-0 h-[3rem]'
                : ''
            } ${
              isSmallScreen && index <= 2 ? '' : ''
            }flex-col md:px-1.5 lg:px-3 py-2 md:-mb-0 lg:mt-1 md:w-auto lg:w-auto md:mt-1 md:h-[99%] lg:h-[99%] shadow- items-center lg:space-y-12 md:space-y-12  rounded-md `}
          >
            {!isSmallScreen && (
              <div className='flex flex-col items-center h-1/6 mt-1 bg-white'>
                <img
                  src={`data:image/png;base64,${imageUrl}`}
                  alt='Avatar'
                  width='60'
                  height='60'
                  className='rounded-full'
                  style={{ aspectRatio: '40 / 40', objectFit: 'cover' }}
                />
              </div>
            )}

            {isSmallScreen && <div className='w-screen h-[1px] mb-2 bg-gray-300'></div>}
            <div
              className={`flex ${
                isSmallScreen ? 'flex-row h-full' : 'flex-col'
              } items-center justify-between lg:gap-12 md:gap-12 w-full`}
            >
              <nav
                className={`${
                  isSmallScreen
                    ? 'flex h-full w-full justify-between items-center -mt-6 -mb-3'
                    : 'grid items-start'
                } ${
                  index >= 2 && index < 6 ? '-mb-4' : '-mt-4'
                }  h-5/6 py-3 px-2 space-y-3 text-sm font-medium`}
              >
                <a
                  class={` flex items-center justify-center font-normal mt-3.5 text-lg gap-3  hover:bg-gray-100 rounded-lg px-3 py-2 ${
                    index == 0 ? 'bg-gray-100 text-gray-950 ' : 'text-gray-600'
                  }  transition-all hover:text-gray-950 dark:bg-gray-800 dark:text-gray-50 dark:hover:text-gray-50`}
                  href='#'
                  onClick={() => {
                    updateIndex(0);
                    navigateToDashboard({ state: { username } });
                  }}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-7 w-7' // Adjust the size of the icon using tailwindcss classes
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2' // Use strokeWidth instead of stroke-width
                    strokeLinecap='round' // Use camelCase instead of kebab-case
                    strokeLinejoin='round' // Use camelCase instead of kebab-case
                  >
                    <path d='m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'></path>
                    <polyline points='9 22 9 12 15 12 15 22'></polyline>
                  </svg>
                </a>
                <a
                  class={`flex items-center justify-center font-normal -mt-1 text-lg gap-3  hover:bg-gray-100 rounded-lg  px-3 py-2 ${
                    index == 1 ? 'bg-gray-100 text-gray-950' : 'text-gray-600'
                  }  transition-all hover:text-gray-950 dark:bg-gray-800 dark:text-gray-50 dark:hover:text-gray-50`}
                  href='#'
                  onClick={() => {
                    updateIndex(1);
                    navigatetoprofile({ state: { username } });
                  }}
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
                    className='w-7 h-7'
                  >
                    <path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'></path>
                    <circle cx='12' cy='7' r='4'></circle>
                  </svg>
                </a>
                <a
                  class={`flex items-center justify-center font-normal -mt-0.5 text-lg gap-3  hover:bg-gray-100 rounded-lg  px-3 py-2 ${
                    index == 2 ? 'bg-gray-100 text-gray-950' : 'text-gray-600'
                  }  transition-all hover:text-gray-950 dark:bg-gray-800 dark:text-gray-50 dark:hover:text-gray-50`}
                  href='#'
                  onClick={async () => {
                    updateIndex(2);
                    await seenotifications();
                  }}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-7 w-7'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    stroke-width='2'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    // class='h-4 w-4'
                  >
                    <path d='M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9'></path>
                    <path d='M10.3 21a1.94 1.94 0 0 0 3.4 0'></path>
                  </svg>

                  {count > 0 && index !== 2 && (
                    <div class='whitespace-nowrap border mt-1 bg-black text-white text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full'>
                      {count}
                    </div>
                  )}
                </a>
                <a
                  class={`flex items-center justify-center font-normal -mt-0.5 text-lg gap-3  hover:bg-gray-100 rounded-lg  px-3 py-2 ${
                    index == 3 ? 'bg-gray-100 text-gray-950' : 'text-gray-600'
                  }  transition-all hover:text-gray-950 dark:bg-gray-800 dark:text-gray-50 dark:hover:text-gray-50`}
                  href='#'
                  onClick={() => {
                    updateIndex(3);
                  }}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-7 w-7'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    stroke-width='2'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    // class='h-4 w-4'
                  >
                    <path d='M14 19a6 6 0 0 0-12 0'></path>
                    <circle cx='8' cy='9' r='4'></circle>
                    <path d='M22 19a6 6 0 0 0-6-6 4 4 0 1 0 0-8'></path>
                  </svg>
                </a>
                <a
                  class={`flex items-center justify-center font-normal -mt-0.5 text-lg gap-3  hover:bg-gray-100 rounded-lg  px-3 py-2 ${
                    index == 4 ? 'bg-gray-100 text-gray-950' : 'text-gray-600'
                  }  transition-all hover:text-gray-950 dark:bg-gray-800 dark:text-gray-50 dark:hover:text-gray-50`}
                  href='#'
                  onClick={() => {
                    updateIndex(4);
                  }}
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
                    class='h-7 w-7 '
                  >
                    <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'></path>
                    <circle cx='9' cy='7' r='4'></circle>
                    <line x1='19' x2='19' y1='8' y2='14'></line>
                    <line x1='22' x2='16' y1='11' y2='11'></line>
                  </svg>
                </a>
                <a
                  class={`flex items-center justify-center font-normal -mt-0.5 text-lg gap-3  hover:bg-gray-100 rounded-lg  px-3 py-2 ${
                    index == 5 ? 'bg-gray-100 text-gray-950' : 'text-gray-600'
                  }  transition-all hover:text-gray-950 dark:bg-gray-800 dark:text-gray-50 dark:hover:text-gray-50`}
                  href='#'
                  onClick={() => {
                    updateIndex(5);
                  }}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-7 w-7'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    stroke-width='2'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    // class='h-4 w-4'
                  >
                    <circle cx='11' cy='11' r='8'></circle>
                    <path d='m21 21-4.3-4.3'></path>
                  </svg>
                </a>
                <a
                  class={`flex items-center font-normal  -mt-0.5 text-lg gap-3  hover:bg-gray-100 rounded-lg  px-3 py-2 ${
                    index == 6 ? 'bg-gray-100 text-gray-950' : 'text-gray-600'
                  }  transition-all hover:text-gray-950 dark:bg-gray-800 dark:text-gray-50 dark:hover:text-gray-50`}
                  href='#'
                  onClick={() => navigatetochat()}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-7 w-7'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    stroke-width='2'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    // class='h-4 w-4'
                  >
                    <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'></path>
                  </svg>
                  {chatcount > 0 && (
                    <div class='whitespace-nowrap bg-black text-white border text-sm mt-1 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full'>
                      {chatcount}
                    </div>
                  )}
                </a>
              </nav>
              {!isSmallScreen && (
                <svg
                  onClick={async () => {
                    await logout();
                  }}
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-12 w-12 mt-12 p-2 transform hover:bg-gray-100 rotate-180 text-gray-600'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  stroke-width='2'
                  stroke-linecap='round'
                  stroke-linejoin='round'
                  // class='h-4 w-4 transform rotate-180'
                >
                  <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'></path>
                  <polyline points='16 17 21 12 16 7'></polyline>
                  <line x1='21' x2='9' y1='12' y2='12'></line>
                </svg>
              )}
            </div>
          </div>
          {isSmallScreen && (
            <div
              className={`absolute  ${
                index >= 2 ? 'absolute -top-9 right-3' : '-top-10 -left-2.5'
              }`}
            >
              <svg
                onClick={async () => {
                  await logout();
                }}
                xmlns='http://www.w3.org/2000/svg'
                className={`h-12 w-12 mt-12 p-2 transform hover:bg-gray-100 rotate-180 text-gray-700 `}
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                stroke-width='2'
                stroke-linecap='round'
                stroke-linejoin='round'
                // class='h-4 w-4 transform rotate-180'
              >
                <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'></path>
                <polyline points='16 17 21 12 16 7'></polyline>
                <line x1='21' x2='9' y1='12' y2='12'></line>
              </svg>
            </div>
          )}
          {!isSmallScreen && (
            <div className='flex lg:w-auto h-auto lg:h-[46rem] items-center lg:-ml-1'>
              <div className='h-[103%] mt-9 bg-gray-300 ml-1 w-[1.5px]'></div>
              {index === 2 && !isSmallScreen && (
                <div className='lg:w-[90%] w-screen h-full'>
                  <div className='lg:h-[100%] md:h-[98.7%] lg:w-full h-[89%] lg:mt-1 md:mt-1 bg-white md:w-[93%] w-[79%] pr-4 rounded-md lg:px-2'>
                    <div className='flex flex-col items-start lg:w-[22rem] h-full ml-1 w-full relative mr-2'>
                      <div className='ml-2 mt-6 mb-3 text-3xl text-black'>Notifications</div>
                      <div className='md:w-[94%] lg:w-[88%] h-[1.5px] ml-2 -mt-1.5 bg-gray-300'></div>
                      <Notifications username={username}></Notifications>
                    </div>
                  </div>
                </div>
              )}
              {index === 3 && !isSmallScreen && (
                <div className='lg:w-[90%] w-screen h-full'>
                  <div className='lg:h-[98%] md:h-[98.7%] lg:w-full h-[89%] lg:mt-1 md:mt-1 bg-white md:w-[93%] w-[79%] pr-4 rounded-md lg:px-2'>
                    <div className='flex flex-col items-start lg:w-[22\rem] h-full ml-1 w-full relative mr-2'>
                      <div className='ml-2.5 mt-6 mb-3 text-3xl text-black'>Followers</div>
                      <div className='md:w-[94%] lg:w-[88%] h-[1.5px] ml-2 -mt-1.5 bg-gray-300'></div>
                      <Followers username={username}></Followers>
                    </div>
                  </div>
                </div>
              )}
              {index === 4 && !isSmallScreen && (
                <div className='lg:w-[90%] w-screen h-full'>
                  <div className='lg:h-[98%] md:h-[98.7%] lg:w-full h-[89%] lg:mt-1 md:mt-1 bg-white md:w-[93%] w-[79%] pr-4 rounded-md lg:px-2'>
                    <div className='flex flex-col items-start lg:w-[22rem] h-full ml-1 w-full relative mr-2'>
                      <div className='ml-2.5 mt-6 mb-3 text-3xl text-black'>Following</div>
                      <div className='md:w-[94%] lg:w-[88%] h-[1.5px] ml-2 -mt-1.5 bg-gray-300'></div>
                      <Following username={username}></Following>
                    </div>
                  </div>
                </div>
              )}
              {index === 5 && !isSmallScreen && (
                <div className='lg:w-[90%] w-screen h-full'>
                  <div className='lg:h-[98%] md:h-[98.7%] lg:w-full h-[89%] lg:mt-1 md:mt-1 bg-white md:w-[93%] w-[79%] pr-4 rounded-md lg:px-2'>
                    <div className='flex flex-col items-start lg:w-[22rem] h-full ml-1 w-full relative mr-2'>
                      <div className='ml-2.5 mt-6 mb-3 text-3xl text-black'>Search</div>
                      <div className='md:w-[94%] lg:w-[88%] h-[1.5px] ml-2 -mt-1.5 bg-gray-300'></div>
                      <div
                        className={`lg:h-[85%] h-[85%]  ml-2 w-[94%] lg:w-[87.5%] mt-3 rounded-md mr-2.5`}
                      >
                        <div
                          className='flex flex-col flex-col-wrap md:w-full lg:h-full md:h-full overflow-y-scroll space-y-6'
                          style={{ height: 'auto', maxHeight: '100%' }}
                        >
                          <div className='flex w-full items-center space-x-1'>
                            <input
                              className='flex h-10 w-full focus:outline-none  rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'
                              placeholder='Search'
                              type='search'
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className='inline-flex text-white bg-black items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-12'>
                              <svg
                                xmlns='http://www.w3.org/2000/svg'
                                width='24'
                                height='24'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                className='h-4 w-4'
                              >
                                <circle cx='11' cy='11' r='8' />
                                <path d='m21 21-4.3-4.3' />
                              </svg>
                              <span className='sr-only'>Search</span>
                            </button>
                          </div>
                          <div className='space-y-2.5'>
                            {(searchQuery === '' ? list : filteredUsers).map((user) => (
                              <div className='flex flex-col'>
                                <div
                                  key={user.user_name}
                                  className='flex flex-row w-full bg-stone-100 rounded-md p-2 items-center justify-between'
                                >
                                  <div className='flex space-x-2'>
                                    <img
                                      src={`data:image/png;base64,${user.profile}`}
                                      className='h-[3rem] w-[3rem] rounded-full'
                                      alt={`${user.user_name}'s profile`}
                                    />
                                    <div className='text-lg py-3'>{user.user_name}</div>
                                  </div>
                                </div>
                                <div className='w-full h-[2px] bg-gray-300'></div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className='w-full -mt-2 h-[2px] bg-gray-300'></div>
                      </div>
                      {/* <div className='flex w-full max-w-sm items-center space-x-1'>
                        <input
                          className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                          placeholder='Search'
                          type='search'
                        />
                        <button className='inline-flex text-white bg-black items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-12'>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='24'
                            height='24'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            className='h-4 w-4'
                          >
                            <circle cx='11' cy='11' r='8' />
                            <path d='m21 21-4.3-4.3' />
                          </svg>
                          <span className='sr-only'>Search</span>
                        </button>
                      </div> */}
                      {/* <div
                        className={`lg:h-[85%] h-[85%] space-y-4 ml-2 w-[97.5%] lg:w- mt-4 rounded-md mr-2.5`}
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
                      </div> */}
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
