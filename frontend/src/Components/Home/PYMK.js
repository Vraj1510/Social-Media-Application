import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { socket } from './DashBoard';
import { useIndex } from '../IndexContext/IndexContext';

const PYMK = ({ username }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [bool1, setBool1] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  console.log(username);
  useEffect(() => {
    socket.connect();
    socket.on('notifCount', async (count) => {
      await fetchPeople();
    });
  }, []);

  const requestsent1 = async (person, idx) => {
    try {
      const updatedBool1 = [...bool1];
      updatedBool1[idx] = !updatedBool1[idx];

      if (updatedBool1[idx]) {
        await sentRequest1(person);
        socket.connect();
        socket.emit('notif', person);
      } else {
        await deleteRequest1(person);
        socket.connect();
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
      console.log(result.data);
      console.log(users);
      if (result && result.data) {
        const updatedBool1 = new Array(users.length).fill(false);
        users.forEach((user, idx) => {
          if (result.data.find((item) => item.person2 === user.person1)) {
            console.log('GETTING HERE');
            console.log(idx);
            updatedBool1[idx] = true;
          }
        });
        setBool1(updatedBool1);
      }
      console.log(bool1);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const sentRequest1 = async (person) => {
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

      if (!responseData.success) {
        throw new Error(`User creation failed: ${responseData.message}`);
      }

      console.log('User created successfully');
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const deleteRequest1 = async (person) => {
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

      if (!responseData.success) {
        throw new Error(`User creation failed: ${responseData.message}`);
      }

      console.log('User deleted successfully');
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  const fetchPeople = async () => {
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
      const filteredResult = result.filter((user) => user.person1 !== username);
      console.log(filteredResult);
      setUsers(filteredResult);
      setFilteredUsers(filteredResult);
    } catch (error) {
      console.error('Error fetching people:', error);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  useEffect(() => {
    setBool1(new Array(users.length).fill(false));
    fetchrequests();
  }, [users]);

  // Filter the users based on the search query
useEffect(() => {
  console.log(users);
  const filteredList = users.filter(
    (user) =>
      user &&
      user.person1 &&
      user.person1.toLowerCase().includes(searchQuery === '' ? '' : searchQuery.toLowerCase()),
  );
  // if(users.length>0)
  // {
  setFilteredUsers(filteredList);
  // }
  fetchrequests();
}, [users, searchQuery]);


  return (
    <div className='flex space-x-1.5 items-center min-w-[24%] h-[98%]'>
      <div className='h-[100%] bg-gray-300 ml-1 w-[1.5px]'></div>
      <div className='w-[100%] items-center space-y-6 py-3 px-2 mr-4 mt-2 h-screen rounded-lg overflow-y-scroll'>
        <div className='text-gray-950 text-3xl  my-4 '>Find Friends</div>
        {/* <input
        type='text'
        placeholder='Search users...'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className='w-full p-2 mb-4 rounded-md border border-gray-300 bg-stone-50 placeholder-gray-600'
      /> */}
        <div className='flex w-full max-w-sm items-center space-x-2'>
          <input
            className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
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
          {filteredUsers.map((user, idx) => (
            <div className='flex flex-col w-full'>
              <div
                key={user.person1}
                className='flex flex-row overflow-x-scroll bg-stone-100 w-full items-center  justify-between rounded-md p-3'
              >
                <span className='flex items-center space-x-1.5'>
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
                  className={`text-md py-1.5 w-[110px] rounded-md ${
                    bool1[idx]
                      ? 'text-black border shadow-sm border-gray-300 bg-white'
                      : 'bg-black text-white'
                  }`}
                >
                  {bool1[idx] ? 'Requested' : 'Follow'}
                </button>
              </div>
              <div className='w-full h-[2px] bg-gray-300'></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PYMK;
