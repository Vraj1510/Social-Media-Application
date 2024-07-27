import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIndex } from '../IndexContext/IndexContext';
import remove from '../../Images/remove.png';
function Followers() {
  const [followers, setFollowers] = useState([]);
  const [filteredFollowing, setFilteredFollowing] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate1 = useNavigate();
  const { username, updatePerson2, updateIndex } = useIndex();
  const [confirm, setConfirm] = useState(false);
  const navigatetoprofile1 = (state) => {
    const user2 = state.usernames;
    updatePerson2(user2[0]);
    updateIndex(6);
    // users[0]
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
      console.log(responseData1);
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

  // Filter the followed users based on the search query
  useEffect(() => {
    const filteredList = followers.filter((follower) =>
      follower.person2.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredFollowing(filteredList);
  }, [searchQuery, followers]);

  return (
    // <div className={`lg:h-[85%] h-[85%]  ml-2 w-[94%] lg:w-[87.5%] mt-4 rounded-md mr-2.5`}>
    //   <div
    //     className='flex flex-col flex-col-wrap lg:h-full md:h-full overflow-y-scroll space-y-2.5'
    //     style={{ height: 'auto', maxHeight: '100%' }}
    //   >
    //     <input
    //       type='text'
    //       placeholder='Search followers...'
    //       value={searchQuery}
    //       onChange={(e) => setSearchQuery(e.target.value)}
    //       className='w-full p-2 mb-5 rounded-md border border-gray-300'
    //     />
    //     <div className='w-full space-y-2.5'>
    //       {filteredFollowers.map((follower) => (
    //         <div
    //           key={follower.person2}
    //           className='flex flex-row w-full bg-white border border-gray-300 rounded-md p-2 items-center justify-between'
    //         >
    //           <div className='flex items-center'>
    //             <img
    //               src={`data:image/png;base64,${follower.profile}`}
    //               className='h-12 w-12 rounded-full'
    //               alt={`${follower.person2}'s profile`}
    //             />
    //             <div className='ml-3 text-lg'>{follower.person2}</div>
    //           </div>
    //           <button
    //             onClick={() => setConfirm(true)}
    //             className='text-white bg-red-500 px-3 py-1 rounded-md'
    //           >
    //             Unfollow
    //           </button>
    //           {confirm && (
    //             <div className='fixed inset-0 flex justify-center items-center z-50 backdrop-filter backdrop-blur-sm bg-black bg-opacity-50'>
    //               <div className='flex flex-col absolute w-1/4 border-2 rounded-md items-center justify-center space-y-8 border-cyan-600 h-1/3 text-center text-cyan-950 bg-cyan-50'>
    //                 <div className='text-4xl'>Remove Follower</div>
    //                 <div className='text-sm mx-9'>
    //                   Confirm removal of{' '}
    //                   <span className='text-lg font-semibold'>{follower.person1}</span> as your
    //                   follower? No notification will be sent.
    //                 </div>

    //                 <div className='flex w-full justify-around'>
    //                   <div
    //                     onClick={async () => {
    //                       await unfollow(follower.person2);
    //                       setConfirm(false);
    //                     }}
    //                     className='bg-cyan-900 text-white w-1/3 py-1 rounded-md cursor-pointer shadow-2xl border-2 border-cyan-400'
    //                   >
    //                     Yes
    //                   </div>
    //                   <div
    //                     onClick={() => {
    //                       setConfirm(false);
    //                     }}
    //                     className='bg-cyan-900 text-white w-1/3 py-1 rounded-md cursor-pointer shadow-2xl border-2 border-cyan-400'
    //                   >
    //                     No
    //                   </div>
    //                 </div>
    //                 <img
    //                   src={remove}
    //                   className='w-6 h-6 absolute -right-3 -top-11'
    //                   onClick={() => {
    //                     setConfirm(false);
    //                   }}
    //                 ></img>
    //               </div>
    //             </div>
    //           )}
    //         </div>
    //       ))}
    //     </div>
    //   </div>
    // </div>
    <div className={`lg:h-[85%] h-[85%]  ml-2 w-[94%] lg:w-[87.5%] mt-3 rounded-md mr-2.5`}>
      <div
        className='flex flex-col flex-col-wrap lg:h-full md:h-full overflow-y-scroll space-y-6'
        style={{ height: 'auto', maxHeight: '100%' }}
      >
        {/* <input
          type='text'
          placeholder='Search followed users...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='w-full p-2 mb-4 rounded-md border border-gray-300'
        /> */}
        <div className='flex w-full items-center space-x-1'>
          <input
            className='flex h-10 w-full focus:outline-none  rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'
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
          {filteredFollowing.map((follower) => (
            <div className='flex flex-col'>
              <div
                key={follower.person2}
                onClick={() => navigatetoprofile1({ usernames: [follower.person2, username] })}
                className='flex flex-row w-full bg-stone-100 rounded-md p-2 items-center justify-between'
              >
                <div className='flex space-x-2'>
                  <img
                    src={`data:image/png;base64,${follower.profile}`}
                    className='h-[3rem] w-[3rem] rounded-full'
                    alt={`${follower.person2}'s profile`}
                  />
                  <div className='text-lg py-3'>{follower.person2}</div>
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
                      <div className='text-4xl'>Unfollow</div>
                      <div className='text-sm mx-9'>
                        Unfollow
                        <span className='text-lg font-semibold'>{follower.person2}</span>? You won't
                        recieve his updates!
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
              <div className='w-full h-[2px] bg-gray-300'></div>
            </div>
          ))}
        </div>
      </div>
      <div className='w-full -mt-2 h-[2px] bg-gray-300'></div>
    </div>
  );
}

export default Followers;
