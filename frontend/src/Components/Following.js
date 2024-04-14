import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIndex } from './IndexContext';
import remove from '../Images/remove.png';
function Followers() {
  const [followers, setFollowers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate1 = useNavigate();
  const { username } = useIndex();
 const [confirm,setConfirm]=useState(false);
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
              onClick={() => setConfirm(true)}
              className='text-white bg-red-500 px-3 py-1 rounded-md'
            >
              Unfollow
            </button>
            {confirm && (
              <div className='fixed inset-0 flex justify-center items-center z-50 backdrop-filter backdrop-blur-sm bg-black bg-opacity-50'>
                <div className='flex flex-col absolute w-1/4 border-2 rounded-md items-center justify-center space-y-8 border-cyan-600 h-1/3 text-center text-cyan-950 bg-cyan-50'>
                  <div className='text-4xl'>Remove Follower</div>
                  <div className='text-sm mx-9'>
                    Confirm removal of{' '}
                    <span className='text-lg font-semibold'>{follower.person1}</span> as your
                    follower? No notification will be sent.
                  </div>

                  <div className='flex w-full justify-around'>
                    <div
                      onClick={async () => {
                        await unfollow(follower.person2);
                        setConfirm(false);
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
    </div>
  );
}

export default Followers;
