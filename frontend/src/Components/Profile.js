import React, { useState } from 'react';
import { useRef } from 'react';
import img1 from '../Images/profile1.png';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useIndex } from './IndexContext';
import Posts from './Posts';
import AddPost from './Addpost';
import Sidebar from './Sidebar';
import PYMK from './PYMK';
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
    // <div className='flex'>
    //   <div className='flex flex-col w-28 ml-1 items-center pt-2'>
    //     <div className='flex flex-col ml-12 items-center'>
    //       <div className='pt-4'>
    //         {imageUrl ? (
    //           <img
    //             src={imageUrl}
    //             onClick={() => inputRef.current.click()}
    //             className='h-[6rem] w-[6rem] cursor-pointer overflow-hidden rounded-full'
    //             alt='Profile'
    //           />
    //         ) : (
    //           <img
    //             src={img1}
    //             className='h-[6rem] w-[7rem] cursor-pointer overflow-hidden rounded-full'
    //             onClick={() => inputRef.current.click()}
    //             alt='Default Profile'
    //           />
    //         )}
    //         <input
    //           type='file'
    //           className='h-[5rem] w-[5rem] cursor-pointer rounded-lg'
    //           ref={inputRef}
    //           style={{ display: 'none' }}
    //           onChange={handleImageChange}
    //         />
    //       </div>
    //       <text className='text-3xl align-top items font-semibold text-cyan-950'>{username}</text>
    //     </div>
    //     <div className='w-[4rem] ml-1 mt-[5rem] rounded-xl bg-cyan-950'>
    //       <AddPost username={username}></AddPost>
    //       <Form onSubmit={handleFormSubmit}></Form>
    //       <img
    //         src={logoImg}
    //         className='rounded-full h-[5rem] pl-1.5 pr-1.5 w-20 mt-20 pb-5'
    //         alt='Image Description'
    //       />
    //     </div>
    //   </div>
    //   <div>
    //     <div className='flex flex-row'>
    //       <div className='flex flex-row bg-cyan-950 h-[3.8rem] rounded-xl justify-between mt-7 ml-[5.8rem] pl-3'>
    //         <img
    //           onClick={openPopupn}
    //           className='w-[3.6rem] h-[3.4rem] mr-3 pl-1 pr-1 hover:bg-cyan-600'
    //           src={notif}
    //         ></img>
    //         {isPopupOpenn && (
    //           <div className='absolute top-[6rem] left-[13.7rem] w-[28rem] z-10 bg-cyan-950 shadow-md rounded-lg p-4'>
    //             <div className='text-xl text-stone-50 font-semibold mb-2'>Notifications</div>
    //             <Notifications className='z-2' username={username}></Notifications>
    //             <button
    //               onClick={closePopupn}
    //               className='bg-stone-50 hover:text-white text-cyan-950 hover:bg-cyan-600 px-2 py-1 mt-3 rounded-lg'
    //             >
    //               Close
    //             </button>
    //           </div>
    //         )}
    //         <img
    //           src={followers}
    //           onClick={openPopup}
    //           className='w-13 h-[3.8rem] ml-32 pl-1 pr-1 pt-2 pb-1 hover:bg-cyan-600'
    //         ></img>
    //         {isPopupOpen && (
    //           <div className='absolute top-[6rem] left-[26rem] w-[15rem] bg-cyan-950 shadow-md rounded-lg p-4'>
    //             <div className='text-xl text-stone-50 font-semibold mb-2'>Followers</div>
    //             <Following username={username}></Following>
    //             <button
    //               onClick={closePopup}
    //               className='bg-stone-50 text-cyan-950 hover:text-white hover:bg-cyan-600 px-2 py-1 mt-3 rounded-lg'
    //             >
    //               Close
    //             </button>
    //           </div>
    //         )}
    //         <img
    //           src={following}
    //           onClick={openPopupf}
    //           className='w-[4rem] h-[4rem] ml-32 pl-1 pr-1 pb-1 pt-1 mr-2 hover:bg-cyan-600'
    //         ></img>
    //         {isPopupOpenf && (
    //           <div className='absolute top-[6rem] left-[38.5rem] z-10 w-[15rem] w-40 bg-cyan-950 shadow-md rounded-lg p-4'>
    //             <div className='text-xl text-stone-50 font-semibold mb-2'>Following</div>
    //             <Followers username={username}></Followers>
    //             <button
    //               onClick={closePopupf}
    //               className='hover:text-white hover:bg-cyan-600 bg-stone-50 text-cyan-950 px-2 py-1 mt-3 rounded-lg'
    //             >
    //               Close
    //             </button>
    //           </div>
    //         )}
    //       </div>
    //       <textarea
    //         disabled={inputvalue}
    //         ref={inputref}
    //         placeholder={inputValue}
    //         className='h-[4rem] rounded-lg ml-[6rem] mt-[1.5rem] p-1 w-[700px] placeholder-white placeholder-semibold text-semibold text-lg caret-white text-white bg-cyan-950 disabled'
    //         value={inputValue}
    //         onChange={handleInputChange}
    //       />
    //       <img
    //         src={edit}
    //         onClick={inputfunctionedit}
    //         className='w-11 h-10 mt-9 pr-1 pt-1 pb-1 ml-2 pl-1 bg-cyan-950 hover:bg-cyan-600'
    //       ></img>
    //       <img
    //         src={save}
    //         onClick={inputfunctiondisable}
    //         className='w-11 h-10 mt-9 pr-1 pt-1 pb-1 ml-2 pl-1 bg-cyan-950 hover:bg-cyan-600'
    //       ></img>
    //       {/* </div> */}
    //     </div>
    //     <div className='flex flex-row pt-1'>
    //       <div className='flex flex-col overflow-y-scroll mt-16 ml-[3.8rem]'>
    //         <div className='post-container h-[40rem] overflow-y-scroll flex-1'>
    //           <DataHandler username={username} image={imageUrl} />
    //         </div>
    //       </div>
    //       <div className='bg-cyan-950 rounded-lg mt-16 w-[16rem] ml-[3rem] h-[40rem]'>
    //         {/* <PeopleYMK></PeopleYMK> */}
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <div className='md:h-screen lg:h-auto w-screen h-screen'>
      <div
        className={`flex  ${
          isSmallScreen ? 'flex-col flex-col-wrap overflow-y-scroll -mt-1' : 'flex-row'
        } w-full h-full justify-between lg:justify-between`}
      >
        {!isSmallScreen && <Sidebar index={1} username={username}></Sidebar>}
        {(index < 2 || isLargeScreen) && (
          <div className='flex flex-col w-full items-center lg:-ml-0 lg:h-[46rem] md:h-[97%] md:w-full overflow-y-scroll lg:w-[60%]'>
            <div className='flex flex-row items-center space-x-6 lg:-ml-8 md:-ml-4'>
              {!isSmallScreen && imageUrl && (
                <img
                  src={`data:image/png;base64,${imageUrl}`} // Set the src attribute with Base64-encoded image content
                  alt='Profile'
                  className='h-[9rem] w-[9rem] mt-6 cursor-pointer overflow-hidden rounded-full'
                  // onClick={() => inputRef.current.click()}
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
                    {isSmallScreen && imageUrl && (
                      <img
                        src={`data:image/png;base64,${imageUrl}`}
                        className='h-[5rem] w-[5rem] my-4 mr-4 cursor-pointer overflow-hidden rounded-full'
                        alt='Profile'
                      />
                    )}
                    <div className='flex flex-col'>
                      <div className='text-4xl font-light md:mt-5 lg:mt-7'>{username}</div>
                      {isSmallScreen && (
                        <div
                          className={`flex lg:flex-row md:flex-row md:-mt-0 lg:-mt-0 mt-2 -ml-2 items-center md:space-x-6 space-x-2 lg:space-x-6`}
                        >
                          <button className='text-cyan-950 w-24 h-10 border-2 border-sky-300 bg-orange-100 text-lg rounded-lg md:mt-6 lg:mt-6'>
                            Edit Profile
                          </button>
                          <AddPost username={username}></AddPost>
                        </div>
                      )}
                    </div>
                  </div>
                  {!isSmallScreen && (
                    <div
                      className={`flex lg:flex-row md:flex-row md:-mt-0 lg:-mt-0 -mt-2 items-center md:space-x-6 space-x-3 lg:space-x-6`}
                    >
                      <button
                        onClick={() => {
                          navigate('/app/editprofile', { state: { username } });
                        }}
                        className='text-cyan-950 border-2 border-sky-300 w-[120px] h-[50px] bg-orange-100 text-xl rounded-lg md:mt-4 lg:mt-4'
                      >
                        Edit Profile
                      </button>
                      <AddPost username={username}></AddPost>
                    </div>
                  )}
                </div>
                <div className='flex flex-row md:space-x-16 space-x-12 md:-ml-0 lg:-ml-0 ml-1 lg:space-x-16 -mt-1.5 md:mt-0.5 lg:mt-2'>
                  <div className='flex flex-col items-center'>
                    <div className='text-3xl lg:text-3xl md:text-3xl font-medium'>{posts}</div>
                    <div className='text-lg -mt-2 md:-mt-1.5 lg:-mt-1.5 font-light'>Posts</div>
                  </div>
                  <div className='flex flex-col items-center'>
                    <div className='text-3xl lg:text-3xl md:text-3xl font-medium'>{followers}</div>
                    <div className='text-lg -mt-2 md:-mt-1.5 lg:-mt-1.5 font-light'>Following</div>
                  </div>
                  <div className='flex flex-col items-center'>
                    <div className='text-3xl lg:text-3xl md:text-3xl font-medium'>{following}</div>
                    <div className='text-lg -mt-2 md:-mt-1.5 lg:-mt-1.5 font-light'>Followers</div>
                  </div>
                </div>
                <div className='-mr-1 mt-1 -ml-1 shadow-lg px-1 rounded-md text-lg text-cyan-900 bg-cyan-50 border-cyan-300 border-2'>
                  {inputValue}
                </div>
              </div>
            </div>
            <div className='w-[80%] h-[40px] pt-[2px] mt-5 -mb-1.5 bg-gray-300'></div>
            <Posts username1={username} image={imageUrl}></Posts>
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
export default Profile;
