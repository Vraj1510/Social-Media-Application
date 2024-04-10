import React, { useState, useEffect } from 'react';
import leftarrow from '../Images/left-arrow.png';
import rightarrow from '../Images/right-arrow.png';
import comment from '../Images/comment.png';
import share from '../Images/share.png';
import like from '../Images/like.png';
import like1 from '../Images/like1.png';
import more from '../Images/more.png';
import remove from '../Images/remove.png';
import Users from './Users';
// import Like from './Like';
import { socket } from './DashBoard';
import MainComment from './MainComment';
import Comments from './Comments';
import { useIndex } from './IndexContext';
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
    setCurrentImageIndex((prevIndex) => {
      const newIndexes = [...prevIndex];
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
    <div className='flex flex-col w-[97%] ml-1.5 overflow-y-scroll -mt-3 mb-2 lg:h-[100%] lg:w-[52%] md:mr-3 lg:-mt-2 md:-mt-2 lg:mr-0 lg:mx-1'>
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
              className='w-full md:h-[98%] flex flex-col items-center border-2 border-orange-200 shadow-md bg-orange-50 my-4 rounded-lg flex-1'
            >
              <div className='flex flex-row w-[93%] m-2 -ml-2 items-center justify-between space-x-4'>
                <div className='flex flex-row items-center space-x-4'>
                  <img
                    src={`data:image/png;base64,${post.profile}`}
                    className='rounded-full h-10 lg:h-16 md:h-16 w-10 lg:w-16 md:w-16'
                  ></img>
                  <div className='text-2xl lg:text-3xl md:text-3xl text-cyan-950'>
                    {post.person2}
                  </div>
                </div>
                <img src={more} className='w-10 h-10 '></img>
              </div>
              <div className='h-[2px] w-[96%] md:mb-4 lg:mb-4 bg-stone-300'></div>
              <div className='flex flex-col w-[102%] -mt-12 lg:-mt-14'>
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
                <div className='flex flex-col w-auto ml-5 mt-1 lg:mt-2 md:mt-2'>
                  <div className='flex flex-row w-full mt-1'>
                    <Like id={post.id} username={username}></Like>
                    <img
                      onClick={async () => {
                        setComment(post.id);
                        await fetchcomment(post.id);
                      }}
                      src={comment}
                      className='w-7 h-7 lg:w-8 lg:h-8 md:w-8 md:h-8 ml-4 cursor-pointer'
                    ></img>
                    <img
                      src={share}
                      className='w-6 h-6 lg:w-7 lg:h-7 md:w-7 md:h-7 mt-0.5 ml-4 cursor-pointer'
                    ></img>
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
                    className='text-md cursor-pointer -mt-1 md:-mt-1.5 ml-1'
                  >
                    {console.log(map1)}
                    View {map1.get(post.id)} comments
                  </div>
                  <div className='flex flex-row ml-1 -mt-1 md:-mt-1.5 space-x-1 mb-1'>
                    <div className='text-xl font-semibold'>{post.person2}</div>
                    <div className='text-xl'>{post.caption}</div>
                  </div>
                </div>
                <div className='lg:ml-4 md:ml-4 ml-2 mt-2 w-[96%] mb-2'>
                  <MainComment id={post.id} username={username}></MainComment>
                </div>
                {comment1 === post.id && (
                  <div className='fixed inset-0 flex items-center justify-center z-50 backdrop-filter w-full h-full backdrop-blur-sm bg-black bg-opacity-50'>
                    <div className='fixed bg-white w-2/3 h-5/6 px-3 py-2 rounded-lg flex justify-between'>
                      <Comments
                        id={post.id}
                        comments1={[...comments]}
                        username={username}
                      ></Comments>
                      <img
                        src={remove}
                        onClick={() => {
                          setComment(-1);
                        }}
                        className='absolute -top-3 -right-3 h-6 w-6 cursor-pointer'
                      ></img>
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
