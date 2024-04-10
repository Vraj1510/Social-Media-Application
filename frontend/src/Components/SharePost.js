import React, { useEffect, useState } from 'react';
import share from '../Images/share.png';
import remove from '../Images/remove.png';
import { useIndex } from './IndexContext';
import { socket } from './DashBoard';
const SharePost = ({ id }) => {
  const { username } = useIndex();
  const [following, setFollowing] = useState([]);
  const [shared, setShared] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [chats, setChats] = useState([]);
  console.log(selectedUsers);
  const startChat = async ( user) => {
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
      const result=await response.json();
      return result.id;
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
      console.log(selectedUsers);
      selectedUsers.forEach(async (selectedUser) => {
        // Find the corresponding user in responseData array
        const matchingUser = responseData.find((user) => user.username === selectedUser.person2);
        // If a matching user is found, assign its id to the selectedUser object
        if (matchingUser) {
          selectedUser.id = matchingUser.id;
        }
        else
        {
          const response=await startChat(selectedUser.person2);
          console.log(response);
          selectedUser.id=response;
        }
      });
      console.log(selectedUsers);
      setChats(responseData);
    } catch (error) {
      console.error(error.message);
    }
  };
  // useEffect(()=>{
  //   getchats()
  // },[selectedUsers]);
  const sendPosts = async () => {
    await getchats();
    console.log(selectedUsers);

    // Map selectedUsers to an array of promises returned by insertmessage
    const insertPromises = selectedUsers.map((selectedUser) => insertmessage(selectedUser));

    // Wait for all insertmessage promises to resolve
    await Promise.all(insertPromises);

    console.log('All messages inserted');
  };

  // chats[index].id is the room
  const insertmessage = async (selectedUser) => {
    try {
      var myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      var date = new Date();
      var ampm = 'AM';
      var hours = date.getHours() % 24;
      if (date.getHours() > 12) {
        ampm = 'PM';
      }
      var raw = JSON.stringify({
        user1:username,
        user2:selectedUser.person2,
        message:'',
        room: selectedUser.id,
        minutes: date.getMinutes() % 60,
        hours: date.getHours() % 60,
        day: date.getDay(),
        date: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        reply: -1,
        ampm,
        post_id:id,
      });
      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
      };
      const response = await fetch('http://localhost:3001/insertmessage', requestOptions);
      await response.json();
      try {
        socket.connect();
        socket.emit('send_message', selectedUser.person2);
      } catch (error) {
        console.log(error);
      }
    } catch (err) {
      console.error(err.message);
    }
  };
  const followersOfUser = async () => {
    try {
      const username1 = username;
      const body = { username1 };
      const response = await fetch('http://localhost:3001/followersofuser', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const responseData1 = await response.json();
      const images = responseData1.map((follower) => ({
        person2: follower.person2,
        profile: follower.profile,
      }));
      setFollowing(images);
      await getchats();
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    followersOfUser();
  }, []);

  const handleCheckboxChange = (event, user) => {
    const { checked } = event.target;
    if (checked) {
      setSelectedUsers([...selectedUsers, user]);
    } else {
      setSelectedUsers(
        selectedUsers.filter((selectedUser) => selectedUser.person2 !== user.person2),
      );
    }
  };

  return (
    <div>
      <img
        src={share}
        onClick={() => {
          setShared(true);
        }}
        className='w-6 h-6 lg:w-7 lg:h-7 md:w-7 md:h-7 mt-0.5 ml-4 cursor-pointer'
      ></img>
      {shared && (
        <div className='fixed inset-0 flex justify-center items-center z-50 backdrop-filter backdrop-blur-sm bg-black bg-opacity-50'>
          <div className='flex flex-row space-y-4 items-start bg-cyan-100 border-2 border-cyan-400 rounded-md py-6 px-5 w-1/3 relative h-[80%]'>
            <div className='w-full h-full'>
              <div className='text-3xl text-cyan-950'>Share Post</div>
              <div className='h-[1px] w-[100%] ml-1 mb-4 mt-1 bg-stone-400'></div>
              <div className='h-[84%] overflow-y-scroll'>
                {following.map((user) => {
                  return (
                    <div
                      key={user.person2}
                      className='flex  my-1.5 border-2 border-sky-300 rounded-md bg-white p-2 items-center'
                    >
                      <img
                        src={`data:image/png;base64,${user.profile}`}
                        className='h-12 w-12'
                      ></img>
                      <div className='ml-3 w-full text-xl font-light'>{user.person2}</div>
                      <input
                        type='checkbox'
                        id={user.person2}
                        name={user.person2}
                        onChange={(e) => handleCheckboxChange(e, user)}
                        checked={selectedUsers.some(
                          (selectedUser) => selectedUser.person2 === user.person2,
                        )}
                        className='h-5 w-5 mr-2'
                      />
                    </div>
                  );
                })}
              </div>
              <button
                onClick={async() => {
                  setShared(false);
                  await sendPosts()
                }}
                className='w-full border-2 border-sky-400 bg-cyan-800 py-1.5 rounded-lg text-white text-2xl'
              >
                Done
              </button>
            </div>
            <img
              src={remove}
              className='absolute -top-7 -right-3 h-6 w-6'
              onClick={() => {
                setShared(false);
              }}
            ></img>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharePost;
