import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIndex } from './IndexContext';

function Following() {
  const navigate1 = useNavigate();
  const { username } = useIndex();
  const [following, setFollowing] = useState([]);
  const [filteredFollowing, setFilteredFollowing] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const navigatetoprofile1 = (state) => {
    const user2 = state.usernames;
    if (user2[0] === username) {
      navigate1('/app/profile', { state: { username } });
    } else {
      navigate1('/profile1', { state: { usernames: [user2, username] } });
    }
  };

  const userFollowing = async () => {
    try {
      const username1 = username;
      const body = { username1 };
      const response = await fetch('http://localhost:3001/userfollowing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const responseData1 = await response.json();
      const images = responseData1.map((follower) => ({
        person1: follower.person1,
        profile: follower.profile,
      }));
      setFollowing(images);
      setFilteredFollowing(images); // Initialize filteredFollowing with all followed users
    } catch (err) {
      console.error(err.message);
    }
  };

  const removeAsFollower = async (user1) => {
    const body = { user1, user2: username };
    try {
      const response = await fetch('http://localhost:3001/removeFollower', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      await response.json();
      setFollowing((follower1) => follower1.filter((follower2) => follower2.person1 !== user1));
      setFilteredFollowing((follower1) =>
        follower1.filter((follower2) => follower2.person1 !== user1),
      );
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    userFollowing();
  }, [username]);

  // Filter the followed users based on the search query
  useEffect(() => {
    const filteredList = following.filter((follower) =>
      follower.person1.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredFollowing(filteredList);
  }, [following, searchQuery]);

  return (
    <div className={`lg:h-[85%] h-[85%] space-y-4 ml-2 w-[94%] lg:w-[96%] mt-4 rounded-md mr-2.5`}>
      <div
        className='flex flex-col flex-col-wrap w-full lg:h-full md:h-full overflow-y-scroll space-y-2 '
        style={{ height: 'auto', maxHeight: '100%' }}
      >
        <input
          type='text'
          placeholder='Search followed users...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='w-11/12 p-2 mb-4 rounded-md border border-gray-300'
        />
        {filteredFollowing.map((follower) => (
          <div
            key={follower.person1}
            className='flex flex-row bg-white w-[90%] border-2 border-sky-300 shadow-sm justify-between rounded-md cursor-pointer py-1.5 px-2 space-x-2'
          >
            <div className='flex space-x-2'>
              <img
                src={`data:image/png;base64,${follower.profile}`}
                className='h-[3rem] w-[3rem] rounded-full'
                alt={`${follower.person1}'s profile`}
              />
              <div className='text-lg py-3'>{follower.person1}</div>
            </div>
            <button
              onClick={async () => {
                await removeAsFollower(follower.person1);
              }}
              className='text-cyan-950 border-2 border-sky-300 w-40 mt-1 md:h-[45px] lg:h-[45px] h-10 bg-orange-100 text-sm rounded-lg'
            >
              Remove As A Follower
            </button>
          </div>
        ))}
      </div>
      <div className='w-[90%] h-[2px] bg-gray-300'></div>
    </div>
  );
}

export default Following;
