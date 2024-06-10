import React, { useEffect } from 'react';
import add1 from '../Images/Add.png';
import deletechat from '../Images/bin1.png';
import logout1 from '../Images/logout.png';
import { useState } from 'react';
import Chat from './Chat';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { socket } from './DashBoard';
import remove from '../Images/remove.png';
import chatwallpaper from '../Images/chatwallpaper.png';
import { useIndex } from './IndexContext';
// const socket = io.connect('http://localhost:3001');

const fetchProfileImage = async (username1) => {
  try {
    const body = { username1 };
    const response = await fetch('http://localhost:3001/fetchImage', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    return result.imageContent;
  } catch (err) {
    console.error('Error fetching image:', err.message);
  }
};
const ChatHome = () => {
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('http://localhost:3001/checksession', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // This line enables sending cookies
        });
        console.log(response);
        const result = await response.json();
        console.log(result);
        if (result.valid === false) {
          navigate('/auth');
        } else {
          console.log(result.username);
          updateUsername(result.username);
        }
      } catch (err) {
        console.error('Error during session check:', err.message);
      }
    };

    checkSession();
  }, []);
  const { username: username1 } = useIndex();
  const { state } = useLocation();
  const { index1, updateIndex1 } = useIndex();
  const [confirm, setConfirm] = useState(false);
  console.log(index1);
  const [username, updateUsername] = useState(username1);
  const [onlineUsers, setOnlineUsers] = useState([...(state && state.onlineUsers)]);
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [addFriend, setAddFriend] = useState(false);
  const [findAFriend, setFindAFriend] = useState(true);
  const [explore, setExplore] = useState(false);
  const [list, setList] = useState([]);
  const [maps, setMaps] = useState(new Map());
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
  const navigateToDashboard = (state) => {
    navigate('/app', state);
  };
  const handleSearch = (e) => {
    const searchQuery = e.target.value.toLowerCase();
    const filteredChats1 = chats.filter((chat) =>
      chat.username.toLowerCase().includes(searchQuery),
    );
    // setChats(filteredChats);
    setFilteredChats(filteredChats1);
  };
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
    console.log(index1);
  }, [index1]);
  useEffect(() => {
    try {
      socket.connect();
      socket.on('recieve_message', (maps1) => {
        console.log(maps1);
        const newMap = new Map(maps1);
        setMaps(newMap);
        console.log([...newMap]);
        if (index1 !== -1) {
          const updatedMaps = new Map(maps);
          updatedMaps.set(chats[index1].username, 0);
          setMaps(updatedMaps);
        }
      });
    } catch (err) {
      console.log(err);
    }
  }, []);

  // useEffect(() => {
  //   try {
  //     socket.connect();
  //     socket.emit('newUser', username);
  //     console.log(onlineUsers);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }, []);
  useEffect(() => {
    try {
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
    } catch (err) {}
  }, []);
  useEffect(() => {
    try {
      socket.connect();
      socket.on('recieve_message', async (maps1) => {
        console.log(maps1);
        const newMap = new Map(maps1);
        setMaps(newMap);
        console.log([...newMap]);
        if (index1 !== -1) {
          const updatedMaps = new Map(maps);
          updatedMaps.set(chats[index1].username, 0);
          setMaps(updatedMaps);
          // await seeMessages(chats[index].username, username);
        }
      });
    } catch (err) {
      console.log(err);
    }

    // Clean up socket listener
    // return () => {
    //   socket.off('recieve_message');
    // };
  }, [index1, maps, chats]);

  const fetchFriendData = async () => {
    try {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');

      const raw = JSON.stringify({
        username,
      });

      const requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      };

      const response = await fetch('http://localhost:3001/findfriend', requestOptions);
      const responseData1 = await response.json();
      console.log(chats);
      // const filteredList = responseData1.data.filter((user1) => {
      //   return !chats.some((chat) => chat.username === user1.username);
      // });

      // console.log(filteredList);
      setList(responseData1);
    } catch (error) {
      console.error('Error fetching friend data:', error.message);
    }
  };
  const seeMessages = async (user1, user2) => {
    try {
      maps.set(user1, 0);
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
    console.log(response.data);
    setMaps(new Map());
    await response.data.map((entry) => {
      setMaps((prevMaps) => {
        const updatedMaps = new Map(prevMaps);
        updatedMaps.set(entry[0], entry[1]);
        return updatedMaps;
      });
    });
    console.log(maps);
  };

  const startChat = async (username, user) => {
    try {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');

      const raw = JSON.stringify({
        user1: username,
        user2: user,
      });

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
      };

      const response = await fetch('http://localhost:3001/addchat', requestOptions);
      await response.json();
      await getchats();
      updateIndex1((prevIndex) => (chats.length > 0 ? chats.length - 1 : prevIndex));
      setAddFriend(false);
    } catch (err) {
      console.error(err.message);
    }
  };
  const deletechat1 = async (user1, user2) => {
    try {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');

      const raw = JSON.stringify({
        user1,
        user2,
      });

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      };

      console.log('DONE');
      const response = await fetch('http://localhost:3001/deletechat', requestOptions);
      console.log(response);
      if (response.ok) {
        updateIndex1((prevIndex) => Math.max(0, prevIndex - 1));
        setChats((chat1) => chat1.filter((chat) => chat.username !== user2));
        setFilteredChats((chat1) => chat1.filter((chat) => chat.username !== user2));
        setConfirm(false);
        // setList(async (list1) => [...list1, { username: user2, profileImage: await fetchProfileImage(user2) }]);
        list.push({ username: user2, profile: await fetchProfileImage(user2) });
        console.log(list);
        console.log('DONE');
        // await Promise.all([getchats(), fetchFriendData()]);
      } else {
        console.error('Failed to delete chat');
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const getchats = async () => {
    try {
      var myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');

      var raw = JSON.stringify({
        username: username,
      });

      var requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: raw,
      };

      const response = await fetch('http://localhost:3001/fetchchats', requestOptions);
      // if (response.ok) {
      const responseData = await response.json();
      console.log(responseData);
      setChats(responseData);
      setFilteredChats(responseData);
      await fetchFriendData();
    } catch (error) {
      console.error(error.message);
    }
  };
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      await getchats();
      await fetchFriendData();
      await fetchunseen();
    };

    fetchData();
  }, [username]);

  return (
    <div className='w-full h-screen flex flex-row'>
      {((isSmallScreen && index1 === -1) || !isSmallScreen) && (
        <div className='flex flex-col items-start space-y-4 p-3 w-screen md:w-1/3 lg:w-1/4'>
          <div className='flex w-full flex-row justify-between items-center'>
            <div className='flex w-1/6 items-center -space-x-2'>
              <button
                onClick={() => {
                  navigateToDashboard({ state: { username } });
                }}
                class='inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 w-10 mr-4'
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
                  class='w-6 h-6'
                >
                  <path d='m15 18-6-6 6-6'></path>
                </svg>
              </button>
              <div className='text-black text-2xl font-medium'>Chats</div>
            </div>
            <div>
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
                class='h-6 w-6'
                onClick={() => {
                  setAddFriend(true);
                }}
              >
                <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'></path>
                <circle cx='9' cy='7' r='4'></circle>
                <line x1='19' x2='19' y1='8' y2='14'></line>
                <line x1='22' x2='16' y1='11' y2='11'></line>
              </svg>
              {addFriend && (
                <div className='fixed inset-0 flex justify-center items-center z-50 backdrop-filter backdrop-blur-sm bg-black bg-opacity-50'>
                  <div className='relative flex flex-col bg-white p-3 w-[400px] h-[700px] rounded-lg z-50'>
                    <div className='rounded-md text-left text-2xl ml-0.5 my-3'>Find A Friend</div>
                    <img
                      src={remove}
                      className='absolute -right-2 -top-2 w-5 h-5 '
                      onClick={() => {
                        setAddFriend(false);
                      }}
                    ></img>
                    <div className='flex w-full items-center space-x-1'>
                      <input
                        className='flex h-10 w-full rounded-md border focus:outline-none border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'
                        placeholder='Search'
                        type='search'
                      />
                      <button className='inline-flex text-white bg-black items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-11'>
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
                    {list &&
                      list.map((user1, idx) => (
                        <div className='flex flex-col w-full'>
                          <div
                            // key={chat.username}
                            className='flex flex-row mt-4 overflow-x-scroll bg-stone-100 w-full items-center  justify-between rounded-md p-3'
                          >
                            <div className='flex items-center justify-between w-full'>
                              <span className='flex items-center space-x-2'>
                                <img
                                  src={`data:image/png;base64,${user1.profile}`}
                                  className='h-12 w-12 rounded-full'
                                  alt={user1.username}
                                />
                                <span className='text-black text-xl'>{user1.username}</span>
                              </span>
                              <button
                                onClick={() => {
                                  startChat(username, user1.username);
                                }}
                                class='inline-flex items-center bg-white border-gray-300 justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 rounded-md border shadow-md'
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
                                  class='h-6 w-6 text-gray-500 dark:text-gray-400'
                                >
                                  <path d='M7.9 20A9 9 0 1 0 4 16.1L2 22Z'></path>
                                </svg>
                                <span class='sr-only'>Start a conversation</span>
                              </button>
                            </div>
                          </div>
                          <div className='w-full h-[2px] bg-gray-300'></div>
                        </div>
                      ))}
                    {/* <input className='h-[45px] w-full rounded-md p-2' placeholder='Search'></input>
                    <div className='w-full py-4 p-1'>
                      <div className='flex flex-row w-full pt-2'>
                        <button
                          className={`w-1/2 h-[45px] rounded-md text-center text-white text-xl ${
                            findAFriend ? 'bg-cyan-800' : 'bg-cyan-950'
                          }`}
                          onClick={() => {
                            setFindAFriend(true);
                            setExplore(false);
                          }}
                        >
                          Find A Friend
                        </button>
                      </div>
                      <div className='w-full h-[2px] bg-white'></div>
                    </div>
                    {console.log(list)}

                    {findAFriend &&
                      list &&
                      list.map((user1) => {
                        return (
                          <div className='flex flex-row rounded-md justify-between items-center bg-white m-1.5 p-2.5 w-full'>
                            <div className='flex flex-row space-x-3 items-center'>
                              <img
                                className='w-[50px] h-[50px] rounded-full'
                                src={`data:image/png;base64,${user1.profile}`}
                              ></img>
                              <div className='text-2xl'>{user1.username}</div>
                            </div>
                            <button
                              onClick={() => {
                                startChat(username, user1.username);
                              }}
                              className='p-2 rounded-md text-gray-800 bg-cyan-400'
                            >
                              Start A Convo!
                            </button>
                          </div>
                        );
                      })}
                    <button
                      onClick={() => {
                        setAddFriend(false);
                      }}
                      className='bg-stone-50 mt-auto h-12 w-[200px] m-3 hover:text-white text-cyan-950 hover:bg-cyan-600 px-2 py-1 mt-3 rounded-md'
                    >
                      Close
                    </button> */}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* <input
            className='h-[45px] w-full rounded-md p-2 border-2 border-sky-300 placeholder-gray-500'
            placeholder='Find A Chat'
            onChange={handleSearch}
          ></input> */}
          <div className='flex w-full items-center space-x-1'>
            <input
              className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm  file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
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
          </div>
          {console.log(filteredChats)}
          {filteredChats &&
            filteredChats.map((chat, idx) => (
              // <div
              //   className='w-full flex justify-between space-x-3 p-2 border-2 border-orange-200 rounded-md shadow-md items-center flex-row bg-white mt-4 h-[70px]'
              //   key={chat.username}
              //   onClick={() => {
              //     console.log(idx);
              //     updateIndex1(idx);
              //     maps.set(chat.username, 0);
              //     // seeMessages(chat.username, username);
              //   }}
              // >
              //   <div className='flex flex-row items-center space-x-3'>
              //     <img
              //       src={`data:image/png;base64,${chat.profile}`}
              //       className='w-[57px] h-[57px] rounded-full'
              //     ></img>
              //     <div className='text-cyan-950 text-xl'>{chat.username}</div>
              //     {onlineUsers && onlineUsers.some((user) => user.username === chat.username) && (
              //       <div className='w-3 h-3 bg-green-500 rounded-full'></div>
              //     )}
              //     {maps && maps.get(chat.username) > 0 && (
              //       <div className='text-white bg-red-500 rounded-full px-1.5'>
              //         {maps.get(chat.username)}
              //       </div>
              //     )}
              //   </div>
              //   <img
              //     src={deletechat}
              //     onClick={() => {
              //       setConfirm(true);
              //     }}
              //     className='h-[30px] w-[30px]'
              //   ></img>

              //   {confirm && (
              //     <div className='fixed inset-0 flex justify-center items-center z-50 backdrop-filter backdrop-blur-sm bg-black bg-opacity-50'>
              //       <div className='flex flex-col absolute w-1/4 border-2 rounded-md items-center justify-center space-y-8 border-cyan-600 h-1/3 text-center text-cyan-950 bg-cyan-50'>
              //         <div className='text-4xl'>Delete Chat</div>
              //         <div className='text-sm mx-4'>Are You Sure You Want To Delete This Chat?</div>
              //         <div className='flex w-full justify-around'>
              //           <div
              //             onClick={async () => {
              //               await deletechat1(username, chat.username);
              //             }}
              //             className='bg-cyan-900 text-white w-1/3 py-1 rounded-md cursor-pointer shadow-2xl border-2 border-cyan-400'
              //           >
              //             Yes
              //           </div>
              //           <div
              //             onClick={() => {
              //               setConfirm(false);
              //             }}
              //             className='bg-cyan-900 text-white w-1/3 py-1 rounded-md cursor-pointer shadow-2xl border-2 border-cyan-400'
              //           >
              //             No
              //           </div>
              //         </div>
              //         <img
              //           src={remove}
              //           className='w-6 h-6 absolute -right-3 -top-11'
              //           onClick={() => {
              //             setConfirm(false);
              //           }}
              //         ></img>
              //       </div>
              //     </div>
              //   )}
              // </div>
              <div className='flex flex-col w-full'>
                <div
                  key={chat.username}
                  onClick={() => {
                    console.log(idx);
                    updateIndex1(idx);
                    maps.set(chat.username, 0);
                    // seeMessages(chat.username, username);
                  }}
                  className='flex flex-row overflow-x-scroll bg-stone-100 w-full items-center  justify-between rounded-md p-3'
                >
                  <span className='flex items-center space-x-2'>
                    <img
                      src={`data:image/png;base64,${chat.profile}`}
                      className='h-12 w-12 rounded-full'
                      alt={chat.username}
                    />
                    <span className='text-black text-xl'>{chat.username}</span>
                    {onlineUsers && onlineUsers.some((user) => user.username === chat.username) && (
                      <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                    )}
                    {maps && maps.get(chat.username) > 0 && (
                      <div className='text-white bg-red-500 rounded-full px-1.5'>
                        {maps.get(chat.username)}
                      </div>
                    )}
                  </span>
                  <button
                    src={deletechat}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent click event from propagating to the parent div
                      setConfirm(true);
                    }}
                    class='inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground w-8 h-8 rounded-full'
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
                      class='w-6 h-6'
                    >
                      <path d='M3 6h18'></path>
                      <path d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6'></path>
                      <path d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'></path>
                    </svg>
                    <span class='sr-only'>Delete</span>
                  </button>
                </div>
                <div className='w-full h-[2px] bg-gray-300'></div>
                {confirm && (
                  <div className='fixed inset-0 flex justify-center items-center z-50 backdrop-filter backdrop-blur-sm bg-black bg-opacity-50'>
                    <div className='flex flex-col absolute w-1/2 sm:w-1/3 md:w-1/3 lg:w-1/4 border-2  rounded-md items-center justify-center space-y-8  h-1/3 text-center bg-cyan-50'>
                      <div className='text-4xl'>Delete Chat</div>
                      <div className='text-sm mx-4'>Are You Sure You Want To Delete This Chat?</div>
                      <div className='flex w-full justify-around'>
                        <div
                          onClick={async () => {
                            await deletechat1(username, chat.username);
                            updateIndex1(-1);
                          }}
                          className='bg-black text-white w-1/3 py-1 rounded-md cursor-pointer shadow-2xl border-2'
                        >
                          Yes
                        </div>
                        <div
                          onClick={() => {
                            setConfirm(false);
                          }}
                          className='bg-black text-white w-1/3 py-1 rounded-md cursor-pointer shadow-2xl border-2'
                        >
                          No
                        </div>
                      </div>
                      <img
                        src={remove}
                        className='w-5 h-5 absolute -right-3 -top-11'
                        onClick={() => {
                          setConfirm(false);
                        }}
                      ></img>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
      <div className='bg-gray-300 w-[2px]'></div>
      {((isSmallScreen && index1 !== -1) || !isSmallScreen) && (
        <div className='flex w-screen h-screen md:w-2/3 lg:w-3/4 items-center bg-white justify-around'>
          {chats.length > index1 && (
            <Chat username={username} chats={chats} index1={index1} onlineUsers1={onlineUsers} />
          )}
        </div>
      )}
    </div>
  );
};

export default ChatHome;
