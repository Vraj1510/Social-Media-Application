import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIndex } from './IndexContext';
function Followers() {
  const [followers, setFollowers] = useState([]);
  const navigate1 = useNavigate();
  const { username } = useIndex();
  const navigateToProfile1 = (state) => {
    const user2 = state.usernames;
    console.log(user2);
    console.log(username);
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
      // await followersOfUser();

      setFollowers((follower1) => follower1.filter((follower2) => follower2.person2 !== person2));
    } catch (err) {
      console.log(err.message);
    }
  };
  useEffect(() => {
    followersOfUser();
  }, [username]);

  return (
    <div className={`lg:h-[85%] h-[85%] space-y-4 ml-2 w-[94%] lg:w-[96%] mt-4 rounded-md mr-2.5`}>
      <div
        className='flex flex-col flex-col-wrap w-full lg:h-full md:h-full overflow-y-scroll space-y-2 '
        style={{ height: 'auto', maxHeight: '100%' }}
      >
        {followers.map((follower) => {
          return (
            <div
              // onClick={() => navigateToProfile1({ usernames: [follower.person2, username] })}
              className='flex flex-row bg-white w-[90%] border-2 border-sky-300 shadow-sm justify-between rounded-md cursor-pointer py-1.5 px-2 space-x-2'
            >
              <div className='flex space-x-2'>
                <img
                  src={`data:image/png;base64,${follower.profile}`}
                  className='h-[3rem] w-[3rem] rounded-full'
                ></img>
                <div className='text-lg py-3'>{follower.person2}</div>
              </div>
              <button onClick={async()=>{
                await unfollow(follower.person2)
              }} className='text-cyan-950 border-2 border-sky-300 px-3 mt-1 md:h-[45px] lg:h-[45px] h-10 bg-orange-100 text-sm rounded-lg'>
                Unfollow
              </button>
            </div>
          );
        })}
      </div>
      <div className='w-[90%] h-[2px] bg-gray-300'></div>
    </div>
  );
}

export default Followers;
