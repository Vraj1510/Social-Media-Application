import React, { useState, useEffect } from 'react';
import remove from '../../Images/remove.png';
import Users from '../Modules/Users';
// import Like from './Like';
// import { socket } from '../../DashBoard';
import { socket } from '../Home/DashBoard';
import MainComment from './MainComment';
import Comments from './Comments';
import { useSwipeable } from 'react-swipeable';
import { useIndex } from '../IndexContext/IndexContext';
import SharePost from '../Chats/SharePost';
export const fetchPost = async (following2) => {
  try {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    var raw = JSON.stringify({
      username1: following2.person2,
    });

    var requestOptions = {
      method: 'PUT',
      headers: myHeaders,
      body: raw,
    };
    const response = await fetch('http://localhost:3001/fetchpost', requestOptions);
    const result = await response.json();
    const posts1 = result.data.map((post) => ({
      ...post,
      person2: following2.person2,
      profile: following2.profile,
    }));
    return { posts1 };
  } catch (error) {
    console.error('Error fetching posts:', error.message);
    return { posts1: [] }; // Return empty array in case of error
  }
};

const DashBoardPosts = () => {
  const [comment1, setComment] = useState(-1);
  const [comments, setcomments] = useState([]);
  const [posts, setPosts] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState([]);
  const [following, setFollowing] = useState([]);
  const [map, setMap] = useState(new Map());
  const [map1, setMap1] = useState(new Map());
  const { username } = useIndex();
  const [displayLikes, setDisplayLikes] = useState(-1);
  // const SwipeableImage = ({ src, alt, onSwipeLeft, onSwipeRight }) => {
  //   const swipeHandlers = useSwipeable({
  //     onSwipedLeft: onSwipeLeft,
  //     onSwipedRight: onSwipeRight,
  //   });

  //   return <img src={src} alt={alt} {...swipeHandlers} />;
  // };
  const swipeHandlers = (post, idx) => ({
    onSwipedLeft: () => handlePreviousImage(post, idx),
    onSwipedRight: () => handleNextImage(post, idx),
  });

  const Like = ({ id, username }) => {
    const [liked, setLiked] = useState(false);
    // find username of the post
    const likePostHandle = async () => {
      try {
        var myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        const body1 = { id, username };
        var raw = JSON.stringify(body1);
        var requestOptions = {
          method: 'PUT',
          headers: myHeaders,
          body: raw,
        };

        const response = await fetch('http://localhost:3001/handlelikes', requestOptions);
        const data = await response.json();
        console.log(data);
        setLiked(data.success === 'true');
        if (data.success === true) {
          try {
            console.log('done');
            await socket.connect();
            await socket.emit('send_like', [username, id]);
          } catch (err) {
            console.log(err);
          }
        } else {
          try {
            await socket.connect();
            await socket.emit('delete_like', [data.user, username]);
          } catch (err) {
            console.log(err);
          }
        }
        await likePostCheck();
        await fetchlikes();
      } catch (error) {
        console.error('Error handling likes:', error.message);
      }
    };

    const likePostCheck = async () => {
      try {
        var myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        const body1 = { id, username };
        var raw = JSON.stringify(body1);
        var requestOptions = {
          method: 'PUT',
          headers: myHeaders,
          body: raw,
        };

        const response = await fetch('http://localhost:3001/checklike', requestOptions);
        const data = await response.json();
        console.log(data);
        setLiked(data.success === true);
      } catch (error) {
        console.error('Error checking likes:', error.message);
      }
    };

    useEffect(() => {
      likePostCheck();
    }, [username]);

    return (
      <button
        onClick={likePostHandle}
        class='inline-flex m-2 items-end justify-end whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill={liked ? 'black' : 'none'}
          stroke='currentColor'
          stroke-width='2'
          stroke-linecap='round'
          stroke-linejoin='round'
          class='h-6 w-6 hover:cursor-pointer'
        >
          <path d='M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'></path>
        </svg>
      </button>
    );
  };
  const fetchcomment = async (id) => {
    try {
      var myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');

      var raw = JSON.stringify({
        id,
      });

      var requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      };

      const response = await fetch('http://localhost:3001/fetchcomment', requestOptions);
      const result = await response.json();
      setcomments([...result.data]);
      return result.data.length;
    } catch (err) {
      console.log(err.message);
      return 0;
    }
  };

  const comment_count = async () => {
    try {
      var map2 = new Map();
      console.log(posts);
      await Promise.all(
        posts.map(async (post) => {
          const count1 = await fetchcomment(post.id);
          map2.set(post.id, count1);
        }),
      );
      console.log(map2);
      setMap1(map2);
    } catch (error) {
      console.error('Error counting comments:', error.message);
    }
  };
  const fetchlikes = async () => {
    try {
      const newMap = new Map();
      console.log(posts);
      await Promise.all(
        posts &&
          posts.map(async (post) => {
            const id = post.id;
            const body = { id };
            const response = await fetch('http://localhost:3001/getlike', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });
            const responseData1 = await response.json();
            newMap.set(id, responseData1.data);
            // console.log(typeof Object.keys(responseData1.data).length);
            // newMap.set(id, responseData1.data);
          }),
      );
      setMap(newMap); // Set the new map after fetching likes for all posts
      console.log(newMap);
    } catch (error) {
      console.error('Error fetching posts:', error.message);
    }
  };

  const userFollowing = async () => {
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
      setFollowing(images);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleNextImage = (post1, idx) => {
    console.log('handle next');
    setCurrentImageIndex((prevIndexes) => {
      const newIndexes = [...prevIndexes];
      if (newIndexes[idx] < post1.pictures.length - 1) {
        newIndexes[idx] += 1;
      }
      return newIndexes;
    });
  };

  const handlePreviousImage = (post1, idx) => {
    console.log('handle previous');
    setCurrentImageIndex((prevIndexes) => {
      const newIndexes = [...prevIndexes];
      if (newIndexes[idx] > 0) {
        newIndexes[idx] -= 1;
      }
      return newIndexes;
    });
  };

  useEffect(() => {
    async function fetchData() {
      try {
        console.log(following);
        const postsPromises = following.map(async (following1) => await fetchPost(following1));
        const postsResults = await Promise.all(postsPromises);
        const allPosts = postsResults.map(({ posts1 }) => posts1);
        const filteredArray = allPosts.filter((element) => element !== undefined);
        console.log(filteredArray.flat());
        setPosts(filteredArray.flat());
        setCurrentImageIndex(new Array(filteredArray.flat().length).fill(0));
        await fetchlikes(); // Call fetchLikes after setting the posts state
      } catch (error) {
        console.error('Error fetching posts:', error.message);
      }
    }
    if (following.length > 0) {
      fetchData();
    }
  }, [following]);

  useEffect(() => {
    try {
      socket.connect();
      socket.on('liked', async () => {
        console.log('like received');
        console.log(posts);
        await fetchlikes();
      });
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    try {
      socket.connect();
      socket.on('commented', async () => {
        console.log('commentrecievd');
        await comment_count();
      });
    } catch (err) {
      console.log(err);
    }
  }, []);
  useEffect(() => {
    fetchlikes();
  }, [posts]);
  useEffect(() => {
    userFollowing();
  }, [username]);

  useEffect(() => {
    const loadImages = () => {
      posts.forEach((post, idx) => {
        if (post.pictures && post.pictures.length > 0) {
          const image = new Image();
          image.onload = () => {
            setCurrentImageIndex((prevIndexes) => {
              const newIndexes = [...prevIndexes];
              newIndexes[idx] = 0;
              return newIndexes;
            });
          };
          image.src = `data:image/png;base64,${btoa(
            new Uint8Array(post.pictures[0].data).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              '',
            ),
          )}`;
        }
      });
    };
    const loadall = async () => {
      loadImages();
      comment_count();
      fetchlikes();
    };
    loadall();
  }, [posts]);
  useEffect(() => {
    comment_count();
  }, [posts]);
  useEffect(() => {
    fetchlikes();
  }, [posts]);
  return (
    <div className='flex flex-col items-center w-[100%] overflow-y-scroll  lg:h-[97%] lg:w-[55%] md:mr-2 lg:mt-2.5 mt-2  '>
      {console.log(map)}
      {console.log(map1)}
      {console.log(posts)}
      {map &&
        map1 &&
        posts &&
        posts.map((post, idx) => {
          return (
            <div
              key={idx}
              className='w-[90%] md:h-[98%] border bg-stone-100 p-1 flex flex-col items-center mb-4 rounded-lg flex-1'
            >
              <div className='flex flex-col w-[93%] m-2 -ml-2  space-x-4'>
                <div className='flex flex-row items-center space-x-4'>
                  <img
                    src={`data:image/png;base64,${post.profile}`}
                    className='rounded-full h-10 lg:h-12 md:h-16 w-10 lg:w-12 md:w-16'
                  ></img>
                  <div className='text-2xl lg:text-2xl font-medium md:text-3xl text-black'>
                    {post.person2}
                  </div>
                </div>
              </div>
              <div className='flex w-[95%] -mt-3.5 mb-2 items-center justify-center'>
                <div className='h-[2px] my-3 w-[110%] bg-gray-300'></div>
              </div>
              <div className='flex flex-col w-[102%] -mt-14'>
                {post.pictures && post.pictures.length > 0 && (
                  <div className='flex flex-row items-center justify-around w-full relative'>
                    {post.pictures[currentImageIndex[idx]] && (
                      <img
                        key={currentImageIndex[idx]}
                        src={`data:image/png;base64,${post.pictures[currentImageIndex[idx]]}`}
                        alt={`post Image ${currentImageIndex[idx]}`}
                        className='mt-12 h-[14rem] sm:h-[28rem] md:h-[28rem] lg:h-[28rem] w-[95%] lg:w-11/12 md:w-11/12 rounded-md object-cover'
                        {...swipeHandlers(post, idx)}
                      />
                    )}
                  </div>
                )}
                <div className='flex flex-col w-auto ml-5 mt-1 lg:mt-2 md:mt-2'>
                  <div className='flex relative items-center -mt-6 justify-start '>
                    <div className='absolute flex -space-x-2 -left-4 -top-0 flex-row z-auto'>
                      <Like id={post.id} username={username}></Like>
                      <button
                        onClick={async () => {
                          setComment(post.id);
                          await fetchcomment(post.id);
                        }}
                        class='inline-flex m-2 items-end justify-end whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          width='24'
                          height='24'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          stroke-width='2'
                          stroke-linecap='round'
                          stroke-linejoin='round'
                          className='h-6 w-6 -mt-4'
                        >
                          <path d='m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z'></path>
                        </svg>
                        <span class='sr-only'>Comment</span>
                      </button>
                      <SharePost id={post.id}></SharePost>
                    </div>
                    <div className='flex mt-6 w-full justify-center gap-4'>
                      <div
                        className='flex cursor-pointer h-5 w-5'
                        onClick={() => {
                          handlePreviousImage(post, idx);
                        }}
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          width='24'
                          height='24'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          stroke-width='2'
                          stroke-linecap='round'
                          stroke-linejoin='round'
                          class='h-5 w-5 cursor-pointer'
                        >
                          <path d='m12 19-7-7 7-7'></path>
                          <path d='M19 12H5'></path>
                        </svg>
                      </div>
                      <div className='flex items-center gap-2'>
                        {post.pictures.map((_, index) => (
                          <div
                            key={index}
                            className={`h-2 w-2 rounded-full ${
                              index === currentImageIndex[idx]
                                ? 'bg-gray-700'
                                : 'bg-gray-400 dark:bg-gray-600'
                            }`}
                          ></div>
                        ))}
                      </div>
                      <div
                        className='cursor-pointer'
                        onClick={() => {
                          handleNextImage(post, idx);
                        }}
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          width='24'
                          height='24'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          stroke-width='2'
                          stroke-linecap='round'
                          stroke-linejoin='round'
                          class='h-5 w-5 cursor-pointer'
                        >
                          <path d='M5 12h14'></path>
                          <path d='m12 5 7 7-7 7'></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  {console.log(map)}
                  {displayLikes === idx && (
                    <div className='fixed inset-0 flex justify-center items-center z-50 backdrop-filter backdrop-blur-sm bg-black bg-opacity-50'>
                      <div className='flex flex-col w-1/4 px-4 h-5/6 rounded-md bg-white'>
                        <div className='flex w-full justify-between'>
                          <div className='text-3xl font-normal my-4 ml-1 text-black'>Likes</div>
                          <img
                            src={remove}
                            className='h-5 w-5 -mt-2 -mr-5'
                            onClick={() => {
                              setDisplayLikes(-1);
                            }}
                          ></img>
                        </div>
                        <Users list={[...map.get(post.id)]}></Users>
                      </div>
                    </div>
                  )}
                  <div className='ml-3 mt-3 -space-y-0.5'>
                    <div
                      className='text-md cursor-pointer'
                      onClick={() => {
                        setDisplayLikes(idx);
                      }}
                    >
                      {' '}
                      <div className='text-md'>
                        {posts && map && map.has(post.id) ? map.get(post.id).length : 0} likes
                      </div>
                    </div>
                    <div
                      onClick={async () => {
                        setComment(post.id);
                        await fetchcomment(post.id);
                      }}
                      className='text-md cursor-pointer md:-mt-1.5 '
                    >
                      {console.log(map1)}
                      View {map1.get(post.id)} comments
                    </div>
                    <div className='flex flex-row md:-mt-1.5 space-x-1 '>
                      <div className='text-md font-semibold'>{post.person2}</div>
                      <div className='text-md'>{post.caption}</div>
                    </div>
                  </div>
                </div>
                <div className='lg:ml-4 md:ml-4 ml-2 mt-2 w-[96%] mb-2'>
                  <MainComment id={post.id} username={username}></MainComment>
                </div>
                {comment1 === post.id && (
                  <div className='fixed inset-0 flex items-center justify-center z-50 backdrop-filter w-full h-full backdrop-blur-sm bg-black bg-opacity-50'>
                    <div className='absolute bg-white w-2/3 h-5/6 px-4 py-3 rounded-lg flex justify-between'>
                      <Comments
                        id={post.id}
                        comments1={[...comments]}
                        username={username}
                      ></Comments>
                      <div className='absolute top-3 right-4 flex flex-row space-x-2 items-center'>
                        <button
                          className='bg-black text-white py-1.5 -mb-1 px-4 rounded-md shadow-md'
                          onClick={() => {
                            setComment(-1);
                          }}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
};
export default DashBoardPosts;
