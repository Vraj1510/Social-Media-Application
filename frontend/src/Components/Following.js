import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIndex } from './IndexContext';

function Followers() {
  const [followers, setFollowers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate1 = useNavigate();
  const { username } = useIndex();

  const navigateToProfile1 = (state) => {
    const user2 = state.usernames;
    if (user2[0] === username) {
      navigate1('/app/profile', { state: { username } });
    } else {
      navigate1('/app/profile1', { state: { usernames: [user2, username] } });
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
      setFollowers(images);
    } catch (err) {
      console.error(err.message);
    }
  };

  const unfollow = async (person2) => {
    const body = { person1: username, person2 };
    try {
      const response = await fetch('http://localhost:3001/unfollow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      await response.json();
      setFollowers((follower1) => follower1.filter((follower2) => follower2.person2 !== person2));
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    followersOfUser();
  }, [username]);

  // Filter followers based on search query
  const filteredFollowers = followers.filter((follower) =>
    follower.person2.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className='w-full'>
      <input
        type='text'
        placeholder='Search followers...'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className='w-11/12 p-2 mb-4 mt-2 rounded-md border border-gray-300'
      />
      <div className='w-full'>
        {filteredFollowers.map((follower) => (
          <div
            key={follower.person2}
            className='flex flex-row w-11/12 bg-white border border-gray-300 rounded-md mb-2 p-2 items-center justify-between'
          >
            <div className='flex items-center'>
              <img
                src={`data:image/png;base64,${follower.profile}`}
                className='h-12 w-12 rounded-full'
                alt={`${follower.person2}'s profile`}
              />
              <div className='ml-3 text-lg'>{follower.person2}</div>
            </div>
            <button
              onClick={() => unfollow(follower.person2)}
              className='text-white bg-red-500 px-3 py-1 rounded-md'
            >
              Unfollow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Followers;
