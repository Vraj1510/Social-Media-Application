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
import bin1 from '../Images/bin1.png';
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
      <img
        onClick={likePostHandle}
        src={liked ? like1 : like}
        className='w-7 h-7 lg:w-8 lg:h-8 md:w-8 md:h-8'
        alt='Like Icon'
      />
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
    setCurrentImageIndex((prevIndex) => {
      const newIndexes = [...prevIndex];
      console.log(post1.length);
      console.log(newIndexes[idx]);
      if (newIndexes[idx] < post1.length - 1) {
        newIndexes[idx] += 1;
      }
      return newIndexes;
    });
  };

  const handlePreviousImage = (post1, idx) => {
    setCurrentImageIndex((prevIndex) => {
      const newIndexes = [...prevIndex];
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
    <div className='flex flex-col w-[90%] md:mr-0 lg:-mt-0 md:-mt-0 lg:mr-0 md:w-[90%] lg:w-[80%] md: lg:-ml-0'>
      {posts &&
        posts.map((post, idx) => {
          return (
            <div
              key={idx}
              className='flex flex-col items-center border-2 border-orange-200 bg-orange-50 my-4 w-full rounded-lg'
            >
              <div className='flex flex-row w-11/12 my-2 items-center justify-between space-x-4'>
                <div className='flex flex-row items-center space-x-4'>
                  <img
                    src={`data:image/png;base64,${image}`}
                    className='rounded-full h-10 lg:h-16 md:h-16 w-10 lg:w-16 md:w-16'
                  ></img>
                  <div className='text-2xl lg:text-3xl md:text-3xl text-cyan-950'>{username1}</div>
                </div>
                {username === username1 && (
                  <div className='flex flex-row space-x-4 text-white'>
                    {isSmallScreen ? (
                      <img
                        onClick={() => {
                          DeletePost(post.id);
                        }}
                        src={bin1}
                        className='cursor-pointer h-6 w-6 mt-1 rounded-md'
                      />
                    ) : (
                      <button
                        onClick={() => {
                          DeletePost(post.id);
                        }}
                        className='bg-sky-700 cursor-pointer border-2 border-orange-200 shadow-xl rounded-md py-2 w-20'
                      >
                        Delete
                      </button>
                    )}
                    <div>
                      {isSmallScreen ? (
                        <img
                          onClick={async () => {
                            await handledit();
                          }}
                          src={edit}
                          className='h-6 w-6 mt-1 cursor-pointer rounded-md '
                        />
                      ) : (
                        <button
                          onClick={async () => {
                            await handledit();
                            updateEdit(idx);
                          }}
                          className='bg-sky-700 border-2 border-orange-200 shadow-xl cursor-pointer rounded-md py-2 w-20'
                        >
                          Edit
                        </button>
                      )}

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
              <div className='h-[2px] w-11/12 md:mb-4 lg:mb-4 bg-stone-300'></div>
              <div className='flex flex-col w-full -mt-10'>
                {post.pictures && post.pictures.length > 0 && (
                  <div className='flex flex-row items-center justify-around w-full relative'>
                    <img
                      src={leftarrow}
                      className='w-[2rem] h-[2rem] sm:h-[2.5rem] sm:w-[2.5rem] md:h-[2.5rem] md:w-[2.5rem] lg:h-[3rem] lg:w-[3rem] cursor-pointer z-10 -mr-14 mt-4 rounded-full p-2'
                      onClick={() => handlePreviousImage(post.pictures, idx)}
                    />
                    {post.pictures[currentImageIndex[idx]] && (
                      <img
                        key={currentImageIndex[idx]}
                        src={`data:image/png;base64,${post.pictures[currentImageIndex[idx]]}`}
                        alt={`post Image ${currentImageIndex[idx]}`}
                        className='mt-12 h-[14rem] sm:h-[28rem] md:h-[28rem] lg:h-[28rem] w-[95%] lg:w-11/12 md:w-11/12 rounded-md object-cover'
                      />
                    )}
                    <img
                      src={rightarrow}
                      className='w-[2rem] h-[2rem] sm:h-[2.5rem] sm:w-[2.5rem] md:h-[2.5rem] md:w-[2.5rem] lg:h-[3rem] lg:w-[3rem] cursor-pointer -ml-14 mt-4 rounded-full p-2'
                      onClick={() => handleNextImage(post.pictures, idx)}
                    />
                  </div>
                )}

                <div className='flex flex-col w-full mx-4 mt-1 lg:mt-2 md:mt-2'>
                  <div className='flex flex-row w-full mt-1'>
                    <Like id={post.id} username={username}></Like>
                    <img
                      onClick={async () => {
                        setComment(post.id);
                        await fetchcomment(post.id);
                      }}
                      src={comment}
                      className='h-7 w-7 md:h-8 lg:h-8 md:w-8 lg:w-8 ml-4 cursor-pointer'
                    ></img>
                    <SharePost id={post.id}></SharePost>
                  </div>
                  {console.log(map)}
                  {displayLikes === idx && (
                    <div className='fixed inset-0 flex justify-center items-center z-50 backdrop-filter backdrop-blur-sm bg-black bg-opacity-50'>
                      <div className='flex flex-col w-1/3 h-5/6 rounded-md bg-orange-100 border-2 border-orange-300'>
                        <div className='flex w-full justify-between'>
                          <div className='text-3xl font-normal m-4 text-sky-950'>Likes</div>
                          <img
                            src={remove}
                            className='h-5 w-5 -m-3'
                            onClick={() => {
                              setDisplayLikes(-1);
                            }}
                          ></img>
                        </div>
                        <Users list={[...map.get(post.id)]}></Users>
                      </div>
                    </div>
                  )}

                  <div
                    className='ml-1 text-md cursor-pointer'
                    onClick={() => {
                      setDisplayLikes(idx);
                    }}
                  >
                    {' '}
                    <div className='text-lg text-md'>
                      {posts && map && map.has(post.id) ? map.get(post.id).length : 0} likes
                    </div>
                  </div>

                  <div
                    onClick={async () => {
                      setComment(post.id);
                      await fetchcomment(post.id);
                    }}
                    className='text-md cursor-pointer -mt-1 ml-1'
                  >
                    {console.log(map1)}
                    View {map1.get(post.id)} comments
                  </div>
                  <div className='flex flex-row ml-1 -mt-1 space-x-1 mb-1'>
                    <div className='text-xl font-semibold'>{username1}</div>
                    <div className='text-xl'>{post.caption}</div>
                  </div>
                </div>
                <div className='mx-3 mt-2 mb-1.5'>
                  <MainComment id={post.id} username={username}></MainComment>
                </div>
                {comment1 === post.id && (
                  <div className='fixed inset-0 flex items-center justify-center z-50 backdrop-filter w-full h-full backdrop-blur-sm bg-black bg-opacity-50'>
                    <div className='bg-white w-2/3 h-5/6 p-4 rounded-lg flex flex-col justify-between'>
                      <Comments
                        id={post.id}
                        comments1={[...comments]}
                        username={username}
                      ></Comments>
                      <div className='flex flex-row space-x-2 items-center'>
                        <button
                          className='bg-sky-300 py-1.5 -mb-1 px-2 border-2 rounded-md shadow-md border-gray-300'
                          onClick={() => {
                            setComment(-1);
                          }}
                        >
                          Close
                        </button>
                        <div className='-mb-2  w-full'>
                          <MainComment id={post.id} username={username}></MainComment>
                        </div>
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
