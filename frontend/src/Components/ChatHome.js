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
      return `data:image/png;base64,${result.imageContent}`;
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
      const filteredList = responseData1.data.filter((user1) => {
        return !chats.some((chat) => chat.username === user1.username);
      });

      console.log(filteredList);
      setList(filteredList);
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
        list.push({ username: user2, profileImage: await fetchProfileImage(user2) });
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
    <div className='w-full h-screen bg-cyan-100 flex flex-row'>
      {((isSmallScreen && index1 === -1) || !isSmallScreen) && (
        <div className='flex flex-col items-start space-y-4 p-3 w-screen md:w-1/3 lg:w-1/4'>
          <div className='flex w-full flex-row justify-between items-center'>
            <div className='flex items-center space-x-2'>
              <img
                src={logout1}
                className='h-12 w-12'
                onClick={() => {
                  navigateToDashboard({ state: { username } });
                }}
              ></img>
              <div className='text-cyan-950 text-3xl'>Chats</div>
            </div>
            <div>
              <button
                onClick={() => {
                  setAddFriend(true);
                }}
                className='text-white border-sky-300 shadow-2xl border-2 rounded-md py-2 px-2 lg:w-28 bg-cyan-950'
              >
                Add Friend
              </button>
              {addFriend && (
                <div className='fixed inset-0 flex justify-center items-center z-50 backdrop-filter backdrop-blur-sm bg-black bg-opacity-50'>
                  <div className='flex flex-col items-center bg-cyan-950 p-3 w-[400px] h-[700px] rounded-lg z-50'>
                    <input className='h-[45px] w-full rounded-md p-2' placeholder='Search'></input>
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
                        <button
                          className={`w-1/2 h-[45px] rounded-md text-center text-white text-xl  ${
                            findAFriend ? 'bg-cyan-950' : 'bg-cyan-800'
                          }`}
                          onClick={() => {
                            setFindAFriend(false);
                            setExplore(true);
                          }}
                        >
                          Explore
                        </button>
                      </div>
                      <div className='w-full h-[2px] bg-white'></div>
                    </div>
                    {findAFriend &&
                      list &&
                      list.map((user1) => {
                        return (
                          <div className='flex flex-row rounded-md justify-between items-center bg-white m-1.5 p-2.5 w-full'>
                            <div className='flex flex-row space-x-3 items-center'>
                              <img
                                className='w-[50px] h-[50px] rounded-full'
                                src={user1.profileImage}
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
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <input
            className='h-[45px] w-full rounded-md p-2 border-2 border-sky-300 placeholder-gray-500'
            placeholder='Find A Chat'
            onChange={handleSearch}
          ></input>
          {filteredChats &&
            filteredChats.map((chat, idx) => (
              <div
                className='w-full flex justify-between space-x-3 p-2 border-2 border-orange-200 rounded-md shadow-md items-center flex-row bg-white mt-4 h-[70px]'
                key={chat.username}
                onClick={() => {
                  console.log(idx);
                  updateIndex1(idx);
                  maps.set(chat.username, 0);
                  // seeMessages(chat.username, username);
                }}
              >
                <div className='flex flex-row items-center space-x-3'>
                  <img
                    src={`data:image/png;base64,${chat.profile}`}
                    className='w-[57px] h-[57px] rounded-full'
                  ></img>
                  <div className='text-cyan-950 text-xl'>{chat.username}</div>
                  {onlineUsers && onlineUsers.some((user) => user.username === chat.username) && (
                    <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                  )}
                  {maps && maps.get(chat.username) > 0 && (
                    <div className='text-white bg-red-500 rounded-full px-1.5'>
                      {maps.get(chat.username)}
                    </div>
                  )}
                </div>
                <img
                  src={deletechat}
                  onClick={() => {
                    setConfirm(true);
                  }}
                  className='h-[30px] w-[30px]'
                ></img>

                {confirm && (
                  <div className='fixed inset-0 flex justify-center items-center z-50 backdrop-filter backdrop-blur-sm bg-black bg-opacity-50'>
                    <div className='flex flex-col absolute w-1/4 border-2 rounded-md items-center justify-center space-y-8 border-cyan-600 h-1/3 text-center text-cyan-950 bg-cyan-50'>
                      <div className='text-4xl'>Delete Chat</div>
                      <div className='text-sm mx-4'>Are You Sure You Want To Delete This Chat?</div>
                      <div className='flex w-full justify-around'>
                        <div
                          onClick={async () => {
                            await deletechat1(username, chat.username);
                          }}
                          className='bg-cyan-900 text-white w-1/3 py-1 rounded-md cursor-pointer shadow-2xl border-2 border-cyan-400'
                        >
                          Yes
                        </div>
                        <div
                          onClick={() => {
                            setConfirm(false);
                          }}
                          className='bg-cyan-900 text-white w-1/3 py-1 rounded-md cursor-pointer shadow-2xl border-2 border-cyan-400'
                        >
                          No
                        </div>
                      </div>
                      <img
                        src={remove}
                        className='w-6 h-6 absolute -right-3 -top-11'
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
