import React, { useState } from 'react';
import leftarrow from '../Images/left-arrow.png';
import rightarrow from '../Images/right-arrow.png';
import like from '../Images/like.png';
import like1 from '../Images/like1.png';
import comment from '../Images/comment.png';
import share from '../Images/share.png';
import remove from '../Images/remove.png';
import { useEffect } from 'react';
import EditPost from './EditPost';
import { useRef } from 'react';
import more from '../Images/more.png';
import bin2 from '../Images/bin2.png';
import edit1 from '../Images/edit1.png';
import MainComment from './MainComment';
import Comments from './Comments';
import { useIndex } from './IndexContext';
// const socket = io.connect('http://localhost:3001', { autoConnect: false });
import { socket } from './DashBoard';
import Users from './Users';
import SharePost from './SharePost';
export const fetchPost = async (username1) => {
  try {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    console.log(username1);
    var raw = JSON.stringify({
      username1,
    });

    var requestOptions = {
      method: 'PUT',
      headers: myHeaders,
      body: raw,
    };
    const response = await fetch('http://localhost:3001/fetchpost', requestOptions);
    const result = await response.json();
    console.log(result);
    return { posts: result.data, currentImageIndex: new Array(result.data.length).fill(0) };
  } catch (error) {
    console.error('Error fetching posts:', error.message);
  }
  return {};
};
const Posts = ({ image, username1 }) => {
  const [comment1, setComment] = useState(false);
  const [editPost, setEditPost] = useState(false);
  const [comments, setcomments] = useState([]);
  const [posts, setPosts] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState([]);
  const [map, setMap] = useState(new Map());
  const [user, setUser] = useState(false);
  const [map1, setMap1] = useState(new Map());
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth > 768);
  const { username } = useIndex();
  const { edit, updateEdit } = useIndex();
  const [displayLikes, setDisplayLikes] = useState(-1);
  const [confirm, setConfirm] = useState(-1);
  console.log(username1);
  console.log(username);
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
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { posts: updatedPosts, currentImageIndex: updatedCurrentImageIndex } =
          await fetchPost(username1);
        console.log(updatedPosts);
        setPosts([...updatedPosts]);
        setCurrentImageIndex(updatedCurrentImageIndex);
      } catch (error) {
        console.error('Error fetching posts:', error.message);
      }
    };
    fetchData();
    return () => {};
  }, [edit]);
  const Like = ({ id, username }) => {
    const [liked, setLiked] = useState(false);
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
          console.log('done');
          await socket.connect();
          await socket.emit('send_like', [username, id]);
        } else {
          await socket.connect();
          await socket.emit('delete_like', [data.user, username]);
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
        class='inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10'
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
          class='h-6 w-6'
        >
          <path d='M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'></path>
        </svg>
        <span class='sr-only'>Like</span>
      </button>
    );
  };
  const swipeHandlers = (post, idx) => ({
    onSwipedLeft: () => handlePreviousImage(post, idx),
    onSwipedRight: () => handleNextImage(post, idx),
  });

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

  const handledit = async () => {
    if (editPost) {
      updateEdit(-1);
      // if (username1 !== username) {
      //   setUsername(username1);
      // } else {
      //   console.log('Reaching here');
      //   setUser(true);
      // }
      const fetchData = async () => {
        try {
          const { posts: updatedPosts, currentImageIndex: updatedCurrentImageIndex } =
            await fetchPost(username1);
          console.log(updatedPosts);
          setPosts([...updatedPosts]);
          setCurrentImageIndex(updatedCurrentImageIndex);
        } catch (error) {
          console.error('Error fetching posts:', error.message);
        }
      };
      fetchData();
      return () => {};
    }
    setEditPost(!editPost);
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

  const DeletePost = async (id) => {
    try {
      var myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');

      var raw = JSON.stringify({
        id: id,
      });

      var requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: raw,
      };
      const response = await fetch('http://localhost:3001/deletepost', requestOptions);
      await response.json();
      const { posts: updatedPosts, currentImageIndex: updatedCurrentImageIndex } = await fetchPost(
        username1,
      );
      setPosts(updatedPosts);
      setCurrentImageIndex(updatedCurrentImageIndex);
    } catch (error) {
      console.error('Error fetching posts:', error.message);
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
          }),
      );
      setMap(newMap); // Set the new map after fetching likes for all posts
      console.log(newMap);
    } catch (error) {
      console.error('Error fetching posts:', error.message);
    }
  };

  useEffect(() => {
    console.log(username);
    console.log(username1);
    const fetchData = async () => {
      try {
        console.log(username);
        const { posts: updatedPosts, currentImageIndex: updatedCurrentImageIndex } =
          await fetchPost(username1);
        console.log(updatedPosts);
        setPosts([]);
        setPosts([...updatedPosts]);
        setCurrentImageIndex(updatedCurrentImageIndex);
      } catch (error) {
        console.error('Error fetching posts:', error.message);
      }
    };
    fetchData();
    return () => {};
  }, [username1, username]);
  useEffect(() => {
    fetchlikes();
  }, [posts]);
  useEffect(() => {
    comment_count();
  }, [posts]);

  useEffect(() => {
    socket.connect();
    socket.on('liked', async () => {
      console.log('like received');
      console.log(posts);
      const fetchData = async () => {
        try {
          const { posts: updatedPosts, currentImageIndex: updatedCurrentImageIndex } =
            await fetchPost(username1);
          console.log(updatedPosts);
          setPosts(updatedPosts);
          setCurrentImageIndex(updatedCurrentImageIndex);
          await fetchlikes();
          console.log(updatedPosts.length);
        } catch (error) {
          console.error('Error fetching posts:', error.message);
        }
      };
      fetchData();
    });
  }, []);

  return (
    <div className='flex flex-col items-center justify-around w-[100%] md:mr-0 lg:-mt-0 md:-mt-0 lg:mr-0 md:w-[99%] lg:w-[115%] lg:-ml-14'>
      {posts &&
        posts.map((post, idx) => {
          return (
            <div
              key={idx}
              className='w-[90%] md:h-[98%] lg:min-w-[540px] overflow-x-hidden lg:w-[75%] border bg-stone-100 p-1 flex flex-col items-center mb-4 rounded-lg flex-1 overflow-y-scroll'
            >
              <div className='flex justify-between w-[93%] m-2 -ml-2  space-x-4'>
                <div className='flex flex-row items-center space-x-4'>
                  <img
                    src={`data:image/png;base64,${image}`}
                    className='rounded-full h-10 lg:h-12 md:h-16 w-10 lg:w-12 md:w-16'
                  ></img>
                  <div className='text-2xl lg:text-2xl font-medium md:text-3xl text-black'>
                    {username1}
                  </div>
                </div>
                {username === username1 && (
                  <div className='flex flex-row space-x-4 items-center -mt-1 text-white'>
                    <img
                      onClick={() => {
                        DeletePost(post.id);
                      }}
                      src={bin2}
                      className='cursor-pointer h-8 w-8 mt-1 rounded-md'
                    />
                    {confirm === post.id && (
                      <div className='fixed inset-0 flex justify-center items-center z-50 backdrop-filter backdrop-blur-sm bg-black bg-opacity-50'>
                        <div className='flex flex-col absolute w-1/4 border-2 rounded-md items-center justify-center space-y-8 border-cyan-600 h-1/3 text-center text-cyan-950 bg-cyan-50'>
                          <div className='text-4xl'>Delete Post</div>
                          <div className='text-sm mx-9'>
                            Are you sure you want to delete this post?
                          </div>
                          {console.log(post.id)}
                          <div className='flex w-full justify-around'>
                            <div
                              onClick={async () => {
                                await DeletePost(post.id);
                                setConfirm(-1);
                              }}
                              className='bg-cyan-900 text-white w-1/3 py-1 rounded-md cursor-pointer shadow-2xl border-2 border-cyan-400'
                            >
                              Yes
                            </div>
                            <div
                              onClick={() => {
                                setConfirm(-1);
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
                              setConfirm(-1);
                            }}
                          ></img>
                        </div>
                      </div>
                    )}
                    <div>
                      <img
                        onClick={async () => {
                          await handledit();
                        }}
                        src={edit1}
                        className='h-6 w-6 mt-1 cursor-pointer rounded-md '
                      />
                      {edit === idx && (
                        <div className='fixed inset-0 flex justify-center items-center z-50 backdrop-filter backdrop-blur-sm bg-black bg-opacity-50'>
                          <div className='fixed flex flex-col bg-cyan-700 border-2 border-cyan-950 p-3 w-[71rem] h-[42rem] rounded-lg z-50'>
                            <img
                              src={remove}
                              onClick={async () => await handledit()}
                              className='h-6 w-6 absolute -right-3 -top-3'
                            />
                            <EditPost
                              username={username}
                              id={post.id}
                              idx={idx}
                              posts={posts}
                            ></EditPost>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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

                <div className='flex flex-col w-full ml-5 mt-1 lg:mt-2 md:mt-2'>
                  <div className='flex relative -mt-1'>
                    <div className='flex flex-row '>
                      <Like id={post.id} username={username}></Like>
                      <button
                        onClick={async () => {
                          setComment(post.id);
                          await fetchcomment(post.id);
                        }}
                        class='inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10'
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
                          class='h-6 w-6'
                        >
                          <path d='m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z'></path>
                        </svg>
                        <span class='sr-only'>Comment</span>
                      </button>
                      <SharePost id={post.id}></SharePost>
                    </div>
                    <div className='flex absolute top-3 -left-1 w-full justify-center gap-4 -mt-1'>
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
                            className='h-5 w-5 -mt-2 -mr-6'
                            onClick={() => {
                              setDisplayLikes(-1);
                            }}
                          ></img>
                        </div>
                        <Users list={[...map.get(post.id)]}></Users>
                      </div>
                    </div>
                  )}

                  <div className='ml-3 -mt-0.5 -space-y-0.5'>
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
                      <div className='text-md font-semibold'>{username1}</div>
                      <div className='text-md'>{post.caption}</div>
                    </div>
                  </div>
                </div>
                <div className='lg:ml-4 md:ml-4 ml-2 mt-2 w-[96%] mb-2'>
                  <MainComment id={post.id} username={username}></MainComment>
                </div>
                {comment1 === post.id && (
                  <div className='fixed inset-0 flex items-center justify-center z-50 backdrop-filter w-full h-full backdrop-blur-sm bg-black bg-opacity-50'>
                    <div className='absolute bg-white w-2/3 h-5/6 p-4 rounded-lg flex justify-between'>
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
export default Posts;
