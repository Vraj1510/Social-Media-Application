import React, { useState } from 'react';
import { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useIndex } from '../IndexContext/IndexContext';
import Posts from '../Post/Posts';
import Sidebar from './Sidebar';
import PYMK from './PYMK';
import AddPost from '../Post/Addpost';
let imageUrl;
export const followersOfUser = async (username) => {
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
    return images.length;
  } catch (err) {
    console.error(err.message);
  }
};

export const userFollowing = async (username) => {
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
    return responseData1.length;
  } catch (err) {
    console.error(err.message);
  }
};
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
function Profile() {
  const { state } = useLocation();
  const { username } = useIndex();
  const { updateUsername } = useIndex();
  const inputRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [posts, setPosts] = useState(0);
  const [following, setFollowing] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const { index } = useIndex();
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
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const fetchProfileImage = async () => {
    try {
      var username1 = username;
      const body = { username1 };
      const response = await fetch('http://localhost:3001/fetchImage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      console.log(result);
      setImageUrl(result.imageContent);
    } catch (err) {
      console.error('Error fetching image:', err.message);
    }
  };
  const editprofile1 = () => {
    navigate('/app/editprofile');
  };
  const fetchnote1 = async () => {
    const username1 = username;
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
      console.log(responseData.data);
      if (responseData.success) {
        const notes = responseData.data.map((item) => item.note || '');
        console.log(notes);
        setInputValue(notes);
      } else {
        console.error('Update failed:', responseData.message);
      }
    } catch (err) {
      console.error(err.message);
    }
  };
  const [inputValue, setInputValue] = useState('');
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth > 768);
  const navigate = useNavigate();
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    handleResize(); // Call it once to set initial state based on screen size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [index, isSmallScreen]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userFollowings = await userFollowing(username);
        setFollowing(userFollowings);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };
    fetchData();
  }, [username]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { count1 } = await fetchPost(username);
        setPosts(count1);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };
    fetchData();
  }, [username]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userFollowers = await followersOfUser(username);
        setFollowers(userFollowers);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };
    fetchData();
  }, [username]);

  useEffect(() => {
    fetchProfileImage();
  }, [username]);

  useEffect(() => {
    fetchnote1();
  }, [username]);

  return (
    // <div className='md:h-screen lg:h-auto w-screen h-screen'>
    //   <div
    //     className={`flex  ${
    //       isSmallScreen ? 'flex-col flex-col-wrap overflow-y-scroll -mt-1' : ' flex-row'
    //     } w-full h-full justify-between  lg:justify-between`}
    //   >
    //     {!isSmallScreen && <Sidebar index={1} username={username}></Sidebar>}
    //     {(index < 2 || isLargeScreen) && (
    //       <div
    //         className={`
    //     flex flex-col w-full items-center lg:-ml-0 lg:h-[46rem] md:h-[97%] md:w-full overflow-y-scroll lg:w-[60%]`}
    //       >
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
    //             <div className='text-[3rem] font-light leading-none'>{username}</div>
    //             {inputValue && inputValue !== '' && (
    //               <div className='ml-2 text-lg'>{inputValue}</div>
    //             )}
    //             <div className='flex items-center gap-4 text-center w-full -ml-1.5 sm:w-auto sm:mt-0'>
    //               <div className='space-y-1'>
    //                 <div className='text-2xl font-bold'>{followers}</div>
    //                 <div className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
    //                   followers
    //                 </div>
    //               </div>
    //               <div className='border-l border-r h-8'></div>
    //               <div className='space-y-1'>
    //                 <div className='text-2xl font-bold'>{following}</div>
    //                 <div className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
    //                   following
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
    //           <div className='flex w-3/4 gap-2'>
    //             <div
    //               onClick={() => {
    //                 editprofile1();
    //               }}
    //               className='flex cursor-pointer items-center w-[300px] rounded-2xl px-3 py-1 text-white bg-black text-lg'
    //             >
    //               <button className='inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 w-10 h-10'>
    //                 <svg
    //                   xmlns='http://www.w3.org/2000/svg'
    //                   width='24'
    //                   height='24'
    //                   viewBox='0 0 24 24'
    //                   fill='none'
    //                   stroke='currentColor'
    //                   strokeWidth='2'
    //                   strokeLinecap='round'
    //                   strokeLinejoin='round'
    //                   className='w-5 h-5'
    //                 >
    //                   <path d='M4 13.5V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2h-5.5'></path>
    //                   <polyline points='14 2 14 8 20 8'></polyline>
    //                   <path d='M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44Z'></path>
    //                 </svg>
    //               </button>
    //               <div>Edit Profile</div>
    //             </div>
    //             <div className='flex cursor-pointer items-center w-[300px] rounded-2xl px-3 py-1 border text-black text-lg bg-gray-100'>
    //               <AddPost username={username}></AddPost>
    //             </div>
    //           </div>
    //         </div>
    //         <div className='h-[2px] w-5/6 my-3 bg-gray-300'></div>
    //         <div className={`w-[100%] ${
    //       isLargeScreen && index >= 2 ? 'z-auto ' : ''
    //     }`}>
    //         <Posts username1={username} image={imageUrl}></Posts>
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
      {/* {index < 2 ? (
        <DashBoardPosts username={username}></DashBoardPosts>
      ) : (
        isLargeScreen && <DashBoardPosts username={username}></DashBoardPosts>
      )} */}
      {(index < 2 || isLargeScreen) && (
        <div
          className={`
        flex flex-col w-full items-center lg:-ml-0 lg:h-[48rem] md:h-[97%] md:w-full overflow-y-scroll overflow-x-hidden lg:w-[60%]`}
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
              <div className='text-[2.5rem] font-light leading-none'>{username}</div>
              {inputValue && inputValue !== '' && <div className='ml-2 text-lg'>{inputValue}</div>}
              <div className='flex items-center gap-4 text-center w-full -ml-1.5 sm:w-auto sm:mt-0'>
                <div className='space-y-1'>
                  <div className='text-2xl font-bold'>{followers}</div>
                  <div className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
                    followers
                  </div>
                </div>
                <div className='border-l border-r h-8'></div>
                <div className='space-y-1'>
                  <div className='text-2xl font-bold'>{following}</div>
                  <div className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
                    following
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
            <div className='flex lg:w-3/4 w-full gap-2'>
              <div
                onClick={() => {
                  editprofile1();
                }}
                className='flex cursor-pointer items-center w-[300px] rounded-2xl px-3 py-1 text-white bg-black text-lg'
              >
                <button className='inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 w-10 h-10'>
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
                    className='w-5 h-5'
                  >
                    <path d='M4 13.5V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2h-5.5'></path>
                    <polyline points='14 2 14 8 20 8'></polyline>
                    <path d='M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44Z'></path>
                  </svg>
                </button>
                <div>Edit Profile</div>
              </div>
              <div className='flex cursor-pointer items-center w-[300px] rounded-2xl px-3 py-1 border text-black text-lg bg-gray-100'>
                <AddPost username={username}></AddPost>
              </div>
            </div>
          </div>
          <div className='h-[2px] w-5/6 my-3 bg-gray-300'></div>
          <div
            className={`w-[100%] ${
              isLargeScreen && index >= 2 ? 'flex z-auto items-center justify-around ' : ''
            }`}
          >
            <Posts username1={username} image={imageUrl}></Posts>
          </div>
        </div>
      )}
      {isLargeScreen && username && <PYMK username={username}></PYMK>}
      {isSmallScreen && <Sidebar username={username} index={0}></Sidebar>}
    </div>
  );
}
export default Profile;
