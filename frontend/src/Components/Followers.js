import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIndex } from './IndexContext';

function Following() {
  const navigate1 = useNavigate();
  const { username } = useIndex();
  const [following, setFollowing] = useState([]);
  const [followingLength, setFollowingLength] = useState(0);
  const navigatetoprofile1 = (state) => {
    var user2 = state.usernames;
    console.log(user2);
    console.log(username);
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
      console.log(images);
    } catch (err) {
      console.error(err.message);
    }
  };

  const removeAsFollower = async ( user1 ) => {
    const body = { user1, user2: username };
    try {
      const response = await fetch('http://localhost:3001/removeFollower', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      await response.json();
      setFollowing((follower1) => follower1.filter((follower2) => follower2.person1 !== user1));
      // await userFollowing();
      // setfollower1(false);
    } catch (err) {
      console.log(err.message);
    }
    // refreshPage();
  };
  useEffect(() => {
    userFollowing();
  }, [username]);
  useEffect(() => {
    setFollowingLength(following.length);
  }, [following]);
  return (
    <div className={`lg:h-[85%] h-[85%] space-y-4 ml-2 w-[94%] lg:w-[96%] mt-4 rounded-md mr-2.5`}>
      <div
        className='flex flex-col flex-col-wrap w-full lg:h-full md:h-full overflow-y-scroll space-y-2 '
        style={{ height: 'auto', maxHeight: '100%' }}
      >
        {' '}
        {following.map((follower) => {
          return (
            <div
              // onClick={() => navigatetoprofile1({ usernames: [follower.person1, username] })}
              className='flex flex-row bg-white w-[90%] border-2 border-sky-300 shadow-sm justify-between rounded-md cursor-pointer py-1.5 px-2 space-x-2'
            >
              <div className='flex space-x-2'>
                <img
                  src={`data:image/png;base64,${follower.profile}`}
                  className='h-[3rem] w-[3rem] rounded-full'
                ></img>
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
          );
        })}
      </div>
      <div className='w-[90%] h-[2px] bg-gray-300'></div>
    </div>
  );
}
export default Following;
