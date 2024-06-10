import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import remove from '../Images/remove.png';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useIndex } from './IndexContext';
import PYMK from './PYMK';
import Posts from './Posts';
import Users from './Users';
export const fetchPost = async (username) => {
  try {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    var raw = JSON.stringify({
      username1: username,
    });

    var requestOptions = {
      method: 'PUT',
      headers: myHeaders,
      body: raw,
    };
    const response = await fetch('http://localhost:3001/fetchpostcount', requestOptions);
    const result = await response.json();

    return { count1: result.data };
  } catch (error) {
    console.error('Error fetching posts:', error.message);
  }
  return {};
};
function Profile1() {
  const { state } = useLocation();
  const user2 = state && state.usernames;
  const { username } = useIndex();
  const { updateUsername } = useIndex();
  const { person2 } = useIndex();
  const [followers2, setfollowers2] = useState(0);
  const [following2, setfollowing2] = useState(0);
  const [following1, setfollowing1] = useState(false);
  const navigate = useNavigate();
  const [follower1, setfollower1] = useState(false);
  const [requestsent, setrequestsent] = useState(false);
  const [text, settext] = useState('Follow');
  const [note, setnote] = useState('');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [imageUrl, setImageUrl] = useState([]);
  const [mutual, setMutual] = useState([]);
  const [posts, setPosts] = useState(0);
  const { index } = useIndex();
  const [followersDisplay, setFollowersDisplay] = useState(false);
  const [followingDisplay, setFollowingDisplay] = useState(false);
  const [mutualsDisplay, setMutualsDisplay] = useState(false);
  const refreshPage = () => {
    window.location.reload();
  };
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { count1 } = await fetchPost(person2);
        setPosts(count1);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };
    fetchData();
  }, [person2]);

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
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
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
          //  setUsername1(result.username);
          updateUsername(result.username);
        }
      } catch (err) {
        console.error('Error during session check:', err.message);
      }
    };

    checkSession();
  }, []);
  const removeAsFollower = async ({ person1, person2 }) => {
    const body = { user1: person1, user2: person2 };
    try {
      const response = await fetch('http://localhost:3001/removeFollower', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const response1 = await response.json();
      await response1();
      setfollower1(false);
    } catch (err) {
      console.log(err.message);
    }
    refreshPage();
  };
  const fetchImage = async () => {
    try {
      var username1 = person2;
      const body = { username1 };
      const response = await fetch('http://localhost:3001/fetchImage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        console.error('API request failed with status:', response.status);
        return;
      }
      const result = await response.json();
      setImageUrl(result.imageContent);
    } catch (err) {
      console.error('Error fetching image:', err.message);
    }
  };

  const checkfollower = async ({ person2, person1 }) => {
    try {
      const body = { user1: person2, user2: person1 };
      const response = await fetch('http://localhost:3001/checkfollower', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        console.error('API request failed with status:', response.status);
        return;
      }
      const responseData = await response.json();
      if (responseData.data.length > 0) {
        setfollower1(true);
      }
    } catch (err) {
      console.error(err.message);
    }
  };
  const sentrequest1 = async () => {
    try {
      const id = 'follow';
      const pid = -1;
      const body = { person1: username, person2, id, pid };
      const response = await fetch('http://localhost:3001/sentrequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        console.error('API request failed with status:', response.status);
        return;
      }
      const responseData = await response.json();
      console.log(responseData);
      if (responseData.success) {
        console.log('User created successfully');
      } else {
        console.error('User creation failed:', responseData.message);
      }
    } catch (err) {
      console.error(err.message);
    }
  };
  const deleterequest1 = async () => {
    try {
      const body = { person1: username, person2 };
      const response = await fetch('http://localhost:3001/deleterequest', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        console.error('API request failed with status:', response.status);
        return;
      }
      const responseData = await response.json();
      // console.log(responseData);
      if (responseData.success) {
        console.log('User created successfully');
      } else {
        console.error('User creation failed:', responseData.message);
      }
    } catch (err) {
      console.error(err.message);
    }
  };
  const fetchnote1 = async () => {
    const username1 = person2;
    const body = { username1 };
    try {
      const response = await fetch(`http://localhost:3001/fetchnote`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        console.error('API request failed with status:', response.status);
        return;
      }
      const responseData = await response.json();
      // console.log(responseData);
      if (responseData.success) {
        const notes = responseData.data;
        // console.log('Notes:', notes);
        setnote(notes);
      } else {
        console.error('Update failed:', responseData.message);
      }
    } catch (err) {
      console.error(err.message);
    }
  };
  const followingcondition = async ({ person1, person2 }) => {
    try {
      const body = { user1: person1, user2: person2 };
      console.log(body);
      const response = await fetch('http://localhost:3001/follow', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        console.error('API request failed with status:', response.status);
        return;
      }
      const responseData = await response.json();
      console.log('CHECKING WHILE MOUNTING');
      console.log(responseData);
      if (responseData.data.length >= 1) {
        setfollowing1(true);
      }
    } catch (err) {
      console.error(err.message);
    }
  };
  const requestcondition = async ({ person1, person2 }) => {
    try {
      const body = { person1, person2 };
      const response = await fetch('http://localhost:3001/requestsent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        console.error('API request failed with status:', response.status);
        return;
      }
      const responseData = await response.json();
      if (responseData.data.length === 1) {
        setrequestsent(true);
        setbool1(true);
      }
    } catch (err) {
      console.error(err.message);
    }
  };
  const [bool1, setbool1] = useState(false);
  const requestsent1 = async () => {
    setbool1(!bool1);
    var bool2 = !bool1;
    if (bool2) {
      sentrequest1();
    } else {
      deleterequest1();
    }
  };
  const followersOfUser = async () => {
    try {
      const username1 = person2;
      const body = { username1 };
      const response = await fetch('http://localhost:3001/followersofuser', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const responseData1 = await response.json();
      const images = await responseData1.map((follower) => ({
        user_name: follower.person2,
        profile: follower.profile,
      }));
      setFollowers(images);
      setfollowers2(responseData1.length);
    } catch (err) {
      console.error(err.message);
    }
  };
  const unfollow = async ({ person1, person2 }) => {
    const body = { user1: person1, user2: person2 };
    try {
      const response = await fetch('http://localhost:3001/unfollow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const response1 = await response.json();
      await response1();
    } catch (err) {
      console.log(err.message);
    }
    refreshPage();
  };
  const userFollowing = async () => {
    try {
      const username1 = person2;
      const body = { username1 };
      const response = await fetch('http://localhost:3001/userfollowing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const responseData1 = await response.json();
      const images = await responseData1.map((follower) => ({
        user_name: follower.person1,
        profile: follower.profile,
      }));
      setFollowing(images);
      setfollowing2(responseData1.length);
    } catch (err) {
      console.error(err.message);
    }
  };

  const getAllMutual = async () => {
    const mutualData = new Map();
    // await fetchAll();
    try {
      const body = { user1: username, user2: person2 };
      console.log(username);
      const response = await fetch('http://localhost:3001/mutual', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error('API request failed');
      }
      const responseData1 = await response.json();
      const data1 = await responseData1.map((mutual1) => ({
        person2: mutual1.person2,
        profile: mutual1.profile,
      }));
      setMutual([...data1]);
    } catch (err) {
      console.log(err.message);
    }
  };
  useEffect(() => {
    checkfollower({ person2, person1: username });
    followingcondition({ person1: username, person2 });
    requestcondition({ person1: username, person2 });
    fetchnote1();
    followersOfUser();
    userFollowing();
    fetchImage();
    getAllMutual();
  }, [username]);

  if (following1) {
    return (
      // <div className='md:h-auto lg:h-auto w-screen h-screen'>
      //   <div
      //     className={`flex  ${
      //       isSmallScreen ? 'flex-col flex-col-wrap overflow-y-scroll -mt-1' : 'flex-row'
      //     } w-full h-full justify-between lg:justify-between`}
      //   >
      //     {!isSmallScreen && <Sidebar index={1} username={username}></Sidebar>}
      //     {(index < 2 || isLargeScreen) && (
      //       <div className='flex flex-col w-full items-center lg:-ml-20 md:ml-9 lg:h-[46rem] md:h-auto md:w-full overflow-y-scroll lg:w-8/12'>
      //         <div className='flex space-x-6 justify-center items-center p-6'>
      //           <div className='flex items-center justify-center'>
      //             <img
      //               src={`data:image/png;base64,${imageUrl}`} // Set the src attribute with Base64-encoded image content
      //               alt='Profile'
      //               className='h-[8rem] w-[8rem] cursor-pointer rounded-full'
      //               // onClick={() => inputRef.current.click()}
      //             />
      //           </div>
      //           <div className='flex flex-col space-y-0.5 justify-center'>
      //             <div className='text-[3rem] font-light leading-none'>{person2}</div>
      //             {note && note !== '' && <div className='ml-2 text-lg'>{note}</div>}
      //             <div className='flex items-center gap-4 text-center w-full -ml-1.5 sm:w-auto sm:mt-0'>
      //               <div className='space-y-1'>
      //                 <div className='text-2xl font-bold'>{followers.length}</div>
      //                 <div className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
      //                   followers
      //                 </div>
      //               </div>
      //               <div className='border-l border-r h-8'></div>
      //               <div className='space-y-1'>
      //                 <div className='text-2xl font-bold'>{following.length}</div>
      //                 <div className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
      //                   following
      //                 </div>
      //               </div>
      //               <div className='border-l border-r h-8'></div>
      //               <div className='space-y-1'>
      //                 <div className='text-2xl font-bold'>{mutual.length}</div>
      //                 <div className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
      //                   mutuals
      //                 </div>
      //               </div>
      //               <div className='border-l border-r h-8'></div>
      //               <div className='space-y-1'>
      //                 <div className='text-2xl font-bold'>{posts}</div>
      //                 <div className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
      //                   posts
      //                 </div>
      //               </div>
      //             </div>
      //           </div>
      //         </div>
      //         <div className='flex flex-col items-center w-3/4 px-6'>
      //           <div className='flex w-[88%] gap-2'>
      //             <div
      //               onClick={() => {
      //                 unfollow({ person1: username, person2 });
      //               }}
      //               className='flex cursor-pointer justify-around items-center w-[400px] rounded-2xl px-3 py-1 text-white bg-black text-lg'
      //             >
      //               <div>Unfollow</div>
      //             </div>
      //             {follower1 && (
      //               <div
      //                 onClick={() => {
      //                   removeAsFollower({ person1: username, person2 });
      //                 }}
      //                 className='flex cursor-pointer items-center w-[400px] rounded-2xl px-3 py-1 border text-black text-lg bg-gray-100'
      //               >
      //                 <div>Remove As A Follower</div>
      //               </div>
      //             )}
      //           </div>
      //         </div>
      //         <div className='h-[2px] w-5/6 my-3 bg-gray-300'></div>
      //         <Posts username1={person2} image={imageUrl}></Posts>
      //       </div>
      //     )}
      //     {followingDisplay && (
      //       <div className='fixed inset-0 flex justify-center items-center z-50 backdrop-filter backdrop-blur-sm bg-black bg-opacity-50'>
      //         <div className='flex flex-col w-1/3 h-5/6 rounded-md bg-orange-100 border-2 border-orange-300'>
      //           <div className='flex w-full justify-between'>
      //             <div className='text-3xl font-normal m-4 text-sky-950'>Following</div>
      //             <img
      //               src={remove}
      //               className='h-5 w-5 -m-3 cursor-pointer'
      //               onClick={() => {
      //                 setFollowingDisplay(false);
      //               }}
      //             ></img>
      //           </div>
      //           <Users list={[...following]}></Users>
      //         </div>
      //       </div>
      //     )}
      //     {followersDisplay && (
      //       <div className='fixed inset-0 flex justify-center items-center z-50 backdrop-filter backdrop-blur-sm bg-black bg-opacity-50'>
      //         <div className='flex flex-col w-1/3 h-5/6 rounded-md bg-orange-100 border-2 border-orange-300'>
      //           <div className='flex w-full justify-between'>
      //             <div className='text-3xl font-normal m-4 text-sky-950'>Followers</div>
      //             <img
      //               src={remove}
      //               className='h-5 w-5 -m-3 cursor-pointer'
      //               onClick={() => {
      //                 setFollowersDisplay(false);
      //               }}
      //             ></img>
      //           </div>
      //           <Users list={[...followers]}></Users>
      //         </div>
      //       </div>
      //     )}
      //     {mutualsDisplay && (
      //       <div className='fixed inset-0 flex justify-center items-center z-50 backdrop-filter backdrop-blur-sm bg-black bg-opacity-50'>
      //         <div className='flex flex-col w-1/3 h-5/6 rounded-md bg-orange-100 border-2 border-orange-300'>
      //           <div className='flex w-full justify-between'>
      //             <div className='text-3xl font-normal m-4 text-sky-950'>Mutual Followers</div>
      //             <img
      //               src={remove}
      //               className='h-5 w-5 -m-3 cursor-pointer'
      //               onClick={() => {
      //                 setMutualsDisplay(false);
      //               }}
      //             ></img>
      //           </div>
      //           <Users list={[...mutual]}></Users>
      //         </div>
      //       </div>
      //     )}
      //     {isSmallScreen && (
      //       <div className='w-screen h-auto mt-2'>
      //         {' '}
      //         <Sidebar index={1} username={username}></Sidebar>
      //       </div>
      //     )}

      //     {isLargeScreen && <PYMK username={username}></PYMK>}
      //   </div>
      // </div>

      <div
        className={`flex  ${
          isSmallScreen ? 'flex-col ' : 'flex-row'
        } w-screen h-screen fixed bg-white lg:justify-between `}
      >
        {!isSmallScreen && <Sidebar username={username} index={0}></Sidebar>}
        {(index < 2 || index===6 || isLargeScreen) && (
          <div
            className={`
          flex flex-col w-full items-center lg:-ml-0 lg:h-[46rem] md:h-[97%] md:w-full overflow-y-scroll lg:w-[60%]`}
          >
            <div className='flex space-x-6 justify-center items-center p-6'>
              <div className='flex items-center justify-center'>
                <img
                  src={`data:image/png;base64,${imageUrl}`} // Set the src attribute with Base64-encoded image content
                  alt='Profile'
                  className='h-[8rem] w-[8rem] cursor-pointer rounded-full'
                  // onClick={() => inputRef.current.click()}
                />
              </div>

              <div className='flex flex-col space-y-2 justify-center'>
                <div className='text-[2.5rem] font-light leading-none'>{person2}</div>
                {note && note !== '' && <div className='ml-2 text-lg'>{note}</div>}
                <div className='flex items-center gap-4 text-center w-full -ml-1.5 sm:w-auto sm:mt-0'>
                  <div className='space-y-1'>
                    <div className='text-2xl font-bold'>{followers.length}</div>
                    <div className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
                      followers
                    </div>
                  </div>
                  <div className='border-l border-r h-8'></div>
                  <div className='space-y-1'>
                    <div className='text-2xl font-bold'>{following.length}</div>
                    <div className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
                      following
                    </div>
                  </div>
                  <div className='border-l border-r h-8'></div>
                  <div className='space-y-1'>
                    <div className='text-2xl font-bold'>{mutual.length}</div>
                    <div className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
                      mutuals
                    </div>
                  </div>
                  <div className='border-l border-r h-8'></div>
                  <div className='space-y-1'>
                    <div className='text-2xl font-bold'>{posts}</div>
                    <div className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
                      posts
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='flex flex-col items-center w-3/4 px-6'>
              <div className='flex w-[88%] gap-2'>
                <div
                  onClick={() => {
                    unfollow({ person1: username, person2 });
                  }}
                  className='flex cursor-pointer justify-around items-center w-[400px] rounded-2xl px-3 py-1 text-white bg-black text-lg'
                >
                  <div>Unfollow</div>
                </div>
                {follower1 && (
                  <div
                    onClick={() => {
                      removeAsFollower({ person1: username, person2 });
                    }}
                    className='flex cursor-pointer items-center w-[400px] rounded-2xl px-3 py-1 border text-black text-lg bg-gray-100'
                  >
                    <div>Remove As A Follower</div>
                  </div>
                )}
              </div>
            </div>
            <div className='h-[2px] w-5/6 my-3 bg-gray-300'></div>
            <div
              className={`w-[100%] ${
                isLargeScreen && index >= 2 ? 'flex z-auto items-center justify-around ' : ''
              }`}
            >
              <Posts username1={person2} image={imageUrl}></Posts>
            </div>
          </div>
        )}
        {isLargeScreen && username && <PYMK username={username}></PYMK>}
        {isSmallScreen && <Sidebar username={username} index={0}></Sidebar>}
      </div>
    );
  } else {
    return (
      // <div className='flex flex-col items-center'>
      //   <div className='flex flex-row h-[16rem] w-[90rem] justify-between rounded-lg items-center m-4 bg-cyan-950'>
      //     <div className='flex flex-col justify-evenly items-center ml-7'>
      //       <img src={imageUrl} className='w-[10rem] h-[10rem] rounded-full'></img>
      //       <div className='text-white text-3xl mt-3'>{person2}</div>
      //     </div>
      //     <div className='flex flex-col items-center'>
      //       <img src={followers3} className='w-[4rem] h-[5rem]'></img>
      //       <div className='text-5xl font-light text-white'>{following2}</div>
      //     </div>
      //     <div className='flex flex-col items-center -mb-3'>
      //       <img src={following3} className='w-[4rem] h-[3.8rem]'></img>
      //       <div className='text-5xl font-light text-white mr-3 mt-1'>{followers2}</div>
      //     </div>
      //     <div className='flex flex-col'>
      //       <img
      //         src={mutual3}
      //         onClick={openPopupm}
      //         className='w-[5rem] h-[4rem] hover:bg-cyan-600'
      //       ></img>
      //       {isPopupOpenm && (
      //         <div className='absolute top-[10rem] left-[38rem] w-[12rem] bg-cyan-700 shadow-md rounded-lg p-4'>
      //           <div className='text-xl text-white font-semibold mb-2'>You Both Follow</div>
      //           <div className='flex flex-col bg-stone-50'>
      //             {mutual.get(person2) ? (
      //               mutual.get(person2).map((mutual1) => {
      //                 return (
      //                   <div className='flex m-2'>
      //                     <img
      //                       src={`data:image/png;base64,${mutual1.profile}`}
      //                       className='h-[3rem] w-[3rem] rounded-full'
      //                     ></img>
      //                     <div className='flex w-full pt-1 ml-[0.6rem] text-[1.2rem] h-10'>
      //                       {mutual1.person2}
      //                     </div>
      //                   </div>
      //                 );
      //               })
      //             ) : (
      //               <div></div>
      //             )}
      //           </div>
      //           <button
      //             onClick={closePopupm}
      //             className='hover:bg-cyan-600 m-2 hover:text-white bg-stone-50 text-cyan-950 h-[2rem] w-[5rem] rounded-lg'
      //           >
      //             Close
      //           </button>
      //         </div>
      //       )}
      //       {mutual.get(person2) ? (
      //         <div className='text-5xl text-white ml-5 mt-3'>{mutual.get(person2).length}</div>
      //       ) : (
      //         <div className='text-5xl text-white ml-5 mt-3'>0</div>
      //       )}
      //     </div>
      //     <textarea
      //       value={note}
      //       className='h-[13rem] rounded-lg w-[32rem] text-semibold text-lg text-cyan-950 bg-stone-50 disabled pointer-events-none'
      //     />
      //   </div>
      //   <div className='h-[28rem] w-[90rem] -mt-2 rounded-lg bg-cyan-950'></div>
      // </div>
      <div className='md:h-auto lg:h-auto w-screen h-screen'>
        <div
          className={`flex  ${
            isSmallScreen ? 'flex-col flex-col-wrap overflow-y-scroll -mt-1' : 'flex-row'
          } w-full h-full justify-between lg:justify-between`}
        >
          {!isSmallScreen && <Sidebar index={1} username={username}></Sidebar>}
          {(index < 2 || isLargeScreen) && (
            <div className='flex flex-col w-full items-center lg:-ml-0 md:ml-9 lg:h-[46rem] md:h-auto md:w-full overflow-y-scroll lg:w-8/12'>
              <div className='flex flex-row items-top space-x-8 md:-ml-20'>
                {!isSmallScreen && (
                  <img
                    src={`data:image/png;base64,${imageUrl}`}
                    className='h-[8rem] w-[8rem] m-4 mt-6 cursor-pointer overflow-hidden rounded-full'
                    alt='Profile'
                  />
                )}
                <div className='flex flex-col items-top'>
                  <div
                    className={`flex flex-col lg:flex-row md:flex-row items-top md:space-x-6 space-x-2 lg:space-x-6`}
                  >
                    <div
                      className={`flex items-center md:ml-0 lg:ml-0  ${
                        isSmallScreen ? 'space-x-4' : 'space-x-0'
                      }`}
                    >
                      {isSmallScreen && (
                        <img
                          src={`data:image/png;base64,${imageUrl}`}
                          className='h-[8rem] w-[8rem] m-4 mt-6 cursor-pointer overflow-hidden rounded-full'
                          alt='Profile'
                        />
                      )}
                      <div className='flex flex-col'>
                        <div className='text-3xl md:mt-7 lg:mt-7'>{person2}</div>
                        {isSmallScreen && (
                          <div
                            className={`flex lg:flex-row md:flex-row md:-mt-0 lg:-mt-0 mt-2 -ml-2 items-center md:space-x-6 space-x-2 lg:space-x-6`}
                          >
                            {follower1 && (
                              <button
                                onClick={() => {
                                  removeAsFollower({ person1: username, person2 });
                                }}
                                className='text-cyan-950 w-48 h-10 border-2 border-sky-300 bg-orange-100 text-lg rounded-lg md:mt-6 lg:mt-6'
                              >
                                Remove As A Follower
                              </button>
                            )}

                            <button
                              onClick={requestsent1}
                              value={text}
                              className='text-cyan-950 w-48 h-10 border-2 border-sky-300 bg-orange-100 text-lg rounded-lg md:mt-6 lg:mt-6'
                            >
                              {bool1 ? 'Request Sent' : 'Follow'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {!isSmallScreen && (
                      <div
                        className={`flex lg:flex-row md:flex-row md:-mt-0 lg:-mt-0 mt-2 -ml-2 items-center md:space-x-6 space-x-2 lg:space-x-6`}
                      >
                        {follower1 && (
                          <button
                            onClick={() => {
                              removeAsFollower({ person1: username, person2 });
                            }}
                            className='text-cyan-950 w-48 h-10 border-2 border-sky-300 bg-orange-100 text-lg rounded-lg md:mt-6 lg:mt-6'
                          >
                            Remove As A Follower
                          </button>
                        )}
                        <button
                          onClick={requestsent1}
                          value={text}
                          className='text-cyan-950 w-48 h-10 border-2 border-sky-300 bg-orange-100 text-lg rounded-lg md:mt-6 lg:mt-6'
                        >
                          {bool1 ? 'Request Sent' : 'Follow'}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className='flex flex-row md:space-x-16 space-x-12 md:-ml-0 lg:-ml-0 ml-1 lg:space-x-16 -mt-1.5 md:mt-3 lg:mt-3'>
                    <div className='flex flex-col items-center'>
                      <div className='text-3xl lg:text-4xl md:text-4xl font-medium'>{posts}</div>
                      <div className='text-xl -mt-2 md:-mt-0 lg:-mt-0 font-light'>Posts</div>
                    </div>
                    <div className='flex flex-col items-center'>
                      <div className='text-3xl lg:text-4xl md:text-4xl font-medium'>
                        {followers.length}
                      </div>
                      <div className='text-xl -mt-2 md:-mt-0 lg:-mt-0 font-light'>Following</div>
                    </div>
                    <div className='flex flex-col items-center'>
                      <div className='text-3xl lg:text-4xl md:text-4xl font-medium'>
                        {mutual.length}
                      </div>
                      <div className='text-xl -mt-2 md:-mt-0 lg:-mt-0 font-light'>mutuals</div>
                    </div>
                    <div className='flex flex-col items-center'>
                      <div className='text-3xl lg:text-4xl md:text-4xl font-medium'>
                        {following.length}
                      </div>
                      <div className='text-xl -mt-2 md:-mt-0 lg:-mt-0 font-light'>Followers</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='w-[94%] h-[2px]  mb-1 mt-1 md:-mt-1 lg:-ml-0 md:-ml-12 lg:-mt-1 py-[0.1rem] bg-gray-300'></div>
            </div>
          )}
          {isSmallScreen && (
            <div className='w-screen h-auto mt-2'>
              {' '}
              <Sidebar index={1} username={username}></Sidebar>
            </div>
          )}

          {isLargeScreen && <PYMK username={username}></PYMK>}
        </div>
      </div>
    );
  }
}

export default Profile1;
