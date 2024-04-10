import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { socket } from './DashBoard';
import { useIndex } from './IndexContext';
// const socket = io.connect('http://localhost:3001', { autoConnect: false });
const PYMK = ({username}) => {
  const [users, setUsers] = useState([]);
  const [bool1, setBool1] = useState([]);
  // const { username } = useIndex();
  useEffect(() => {
    socket.connect();
    console.log(socket.id);
    socket.on('notifCount', async (count) => {
      await fetchpeople();
    });
  }, []);
  const requestsent1 = async (person, idx) => {
    try {
      const updatedBool1 = [...bool1];
      updatedBool1[idx] = !updatedBool1[idx];

      if (updatedBool1[idx]) {
        await sentrequest1(person);
        socket.connect();
        console.log('sent');
        socket.emit('notif', person);
      } else {
        await deleterequest1(person);
        socket.connect();
        console.log('deletenotifsent');
        socket.emit('notif', person);
      }

      setBool1(updatedBool1);
    } catch (error) {
      console.error('Error processing request:', error);
    }
  };

  const fetchrequests = async () => {
    try {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      const raw = JSON.stringify({ username });
      const requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: raw,
      };
      const response = await fetch('http://localhost:3001/getrequests', requestOptions);
      const result = await response.json();

      if (result && result.data) {
        const updatedBool1 = new Array(users.length).fill(false);
        users.forEach((user, idx) => {
          if (result.data.find((item) => item.person2 === user.username)) {
            updatedBool1[idx] = true;
          }
        });
        setBool1(updatedBool1);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const sentrequest1 = async (person) => {
    try {
      const id = 'follow';
      const pid = -1;
      const body = { person1: username, person2: person, id, pid };
      const response = await fetch('http://localhost:3001/sentrequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log(responseData);

      if (!responseData.success) {
        throw new Error(`User creation failed: ${responseData.message}`);
      }

      console.log('User created successfully');
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const deleterequest1 = async (person) => {
    try {
      const body = { person1: username, person2: person };
      const response = await fetch('http://localhost:3001/deleterequest', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const responseData = await response.json();
      // console.log(responseData);

      if (!responseData.success) {
        throw new Error(`User creation failed: ${responseData.message}`);
      }

      console.log('User deleted successfully');
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  const fetchpeople = async () => {
    try {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      const raw = JSON.stringify({ username });
      const requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: raw,
      };

      const response = await fetch('http://localhost:3001/notfollowing', requestOptions);
      const result = await response.json();
      console.log(result);
      const filteredResult = result.filter((user) => user.person1 !== username);
      console.log(filteredResult);
      setUsers(filteredResult);
    } catch (error) {
      console.error('Error fetching people:', error);
    }
  };

  useEffect(() => {
    fetchpeople();
  }, [username]);

  useEffect(() => {
    setBool1(new Array(users.length).fill(false));
    fetchrequests();
  }, [users]);

  return (
    <div className='flex flex-col border-2  border-orange-200 shadow-md lg:shadow-2xl lg:h-[45rem] items-center space-y-6 py-3 px-2 bg-orange-50 mr-2 mt-2 h-screen rounded-lg overflow-y-scroll'>
      <div className='text-cyan-950 text-3xl mb-5 m-4 bg-orange-50'>Find Friends</div>
      {users.map((user, idx) => (
        <div
          key={user.person1}
          className='flex w-full flex-row overflow-x-scroll items-center space-x-12 justify-between rounded-md bg-stone-50 shadow-md border-2 border-sky-300 p-3 m-1'
        >
          <span className='flex items-center space-x-1'>
            <img
              src={`data:image/png;base64,${user.profile}`}
              className='h-12 w-12 rounded-full'
              alt={user.person1}
            />
            <span className='text-cyan-950 text-lg'>{user.person1}</span>
          </span>
          <button
            onClick={() => {
              requestsent1(user.person1, idx);
            }}
            className={`text-md px-2 py-1.5 border-2 border-sky-800 rounded-md ${
              bool1[idx] ? 'text-cyan-900 bg-cyan-200' : 'bg-cyan-600 text-white'
            }`}
          >
            {bool1[idx] ? 'Requested' : 'Follow'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default PYMK;
