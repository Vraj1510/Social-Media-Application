import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from './DashBoard';
import { useIndex } from './IndexContext';
import { useMemo } from 'react';
function Notifications() {
  const [notifications, setNotifications] = useState([]);
  // var notifications=[];
  const [reqsent, setReqsent] = useState(true);
  const navigate = useNavigate();
  const { username } = useIndex();
  const addFollowing = async (notification) => {
    try {
      const body = { user1: notification.person1, user2: notification.person2 };
      console.log(body);
      const response = await fetch('http://localhost:3001/addfollowing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      await response.json();
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      console.log(response);
      console.log('Done');
      await updateNotification(notification);
      console.log('After updateNotification');
    } catch (err) {
      console.error(err.message);
    }
  };

  const deleteRequest1 = async (notification) => {
    try {
      console.log('Start deleteRequest1');
      const body = { user1: notification.person1, user2: notification.person2 };
      const response = await fetch('http://localhost:3001/deleterequest1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      console.log(response);
      await response.json();
      console.log('End deleteRequest1');
      await addFollowing(notification);
    } catch (err) {
      console.error(err.message);
    }
  };

  const updateNotification = async (notification) => {
    try {
      console.log('Updating');
      console.log(notification);
      const body = {
        user1: notification.person1,
        user2: notification.person2,
        id1: notification.id,
        pid1: notification.pid,
      };
      const response = await fetch('http://localhost:3001/updatenotification', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      console.log(response);
      await response.json();
      // await fetchNotifications();
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleNotifications = async (count) => {
    console.log('Received notification count:', count);
    await fetchNotifications();
    await seenNotifications();
  };

  useEffect(() => {
    const handleSocketEvent = () => {
      handleNotifications();
    };

    socket.connect();
    socket.on('notifCount', handleSocketEvent);

    return () => {
      socket.off('notifCount', handleSocketEvent);
    };
  }, []); // Ensure this effect runs only once on component mount

  const navigateToProfile = (usernames) => {
    const [user2] = usernames;
    if (user2 === username) {
      navigate('/app/profile', { state: { username } });
    } else {
      navigate('/app/profile1', { state: { usernames: [user2, username] } });
    }
  };

  const seenNotifications = async () => {
    try {
      const body = { username };
      const response = await fetch('http://localhost:3001/seenNotifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      await response.json();
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
    } catch (err) {
      console.error('Error fetching image:', err.message);
    }
  };

  // Add useMemo to memoize the function
  // const handleAcceptClick = useMemo(
  //   () => async (notification) => {
  //     try {

  //       await deleteRequest1(notification);
  //       await socket.emit('notif', notification.person1);
  //     } catch (err) {
  //       console.error(err.message);
  //     }
  //   },
  //   [], // Ensure this function is memoized only once
  // );
  const handleAcceptClick = async (notificationToUpdate) => {
    try {
      // Filter out the notification that has been accepted
      console.log(notifications);
      console.log(notificationToUpdate);
      const updatedNotifications = notifications.map((notification) => {
        if (
          notification.person1 === notificationToUpdate.person1 &&
          notification.id === 'follow' &&
          notificationToUpdate.id === 'follow'
        ) {
          return { ...notification, id: 'following' };
        }
        return notification;
      });
      console.log(updatedNotifications);
      await Promise.all([
        deleteRequest1(notificationToUpdate),
        socket.emit('notif', notificationToUpdate.person1),
      ]);
      // // Set the updated notifications state
      setNotifications([...updatedNotifications]);
      // // notifications=[...updatedNotifications];

      // // Make API calls or emit socket events
    } catch (err) {
      console.error(err.message);
    }
  };

  const fetchNotifications = async () => {
    try {
      const body = { username };
      const response = await fetch('http://localhost:3001/fetchnotifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      const responseData = await response.json();
      console.log(responseData);
      // console.log(updatedNotificat);
      setNotifications([]);
      setNotifications(responseData);
      // notifications=responseData
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [username]);
  useEffect(()=>{
    console.log(notifications);
  },[notifications])
  return (
    <div
      className={`lg:h-[88%] h-[85%]  ml-2 w-[94%] lg:w-[87.5%] mt-4 rounded-md mr-2.5`}
    >
      <div
        className='flex flex-col flex-col-wrap lg:h-full md:h-full overflow-y-scroll space-y-2.5'
        style={{ height: 'auto', maxHeight: '100%' }}
      >
        {console.log(notifications)}
        {notifications.map((notification) => {
          if (notification.person1 === username && notification.id === 'following') {
            return (
              <div
                // key={notification.id} // Ensure each element has a unique key
                onClick={() =>
                  navigateToProfile({
                    usernames: [notification.person2, notification.person1],
                  })
                }
                className='bg-stone-100 rounded-md'
              >
                <div className='flex flex-row ml-2 h-[4.5rem] items-center space-x-2'>
                  <img
                    src={`data:image/png;base64,${notification.person2_profile}`}
                    className='w-[3.5rem] h-[3.5rem] rounded-full'
                    alt={`${notification.person2}'s profile`}
                  ></img>
                  <div className='text-md mr-2 leading-none '>
                    <span className='font-medium text-lg mr-1'>{notification.person2}</span>
                    {''}
                    accepted your follow request!
                  </div>
                </div>
                <div className='w-full h-[2px] bg-gray-300'></div>
              </div>
            );
          } else if (notification.person2 === username && notification.id === 'follow') {
            // if (reqsent) {
              
            return (
              <div
                // key={notification.id} // Ensure each element has a unique key
                className='bg-stone-100 rounded-md'
              >
                <div className='flex flex-row ml-2 h-[4.5rem] items-center space-x-2'>
                  <img
                    src={`data:image/png;base64,${notification.person1_profile}`}
                    className='w-[3.5rem] h-[3.5rem] rounded-full'
                    alt={`${notification.person1}'s profile`}
                  ></img>
                  <span className='leading-none '>
                    <span>
                      <span className='font-medium text-lg mr-1'>{notification.person1}</span>
                      {''}
                      requested to follow you!
                    </span>{' '}
                    <button
                      className='bg-gray-800 text-md text-white rounded-md w-[4.3rem] ml-1 mt-0.5 h-[1.8rem] hover:bg-cyan-600 '
                      onClick={() => handleAcceptClick(notification)}
                    >
                      Accept
                    </button>
                  </span>
                </div>
                <div className='w-full h-[2px] bg-gray-300'></div>
              </div>
            );
          } else if (notification.person2 === username && notification.id === 'following') {
            console.log(notification);
            return (
              <div
                // key={notification.id} // Ensure each element has a unique key
                onClick={() =>
                  navigateToProfile({
                    usernames: [notification.person1, notification.person2],
                  })
                }
                className='bg-stone-100 rounded-md'
               rounded-md>
                <div className='flex'>
                  <div className='flex flex-row ml-2 h-[4.5rem] items-center space-x-2'>
                    <img
                      src={`data:image/png;base64,${notification.person1_profile}`}
                      className='w-[3.5rem] h-[3.5rem] rounded-full'
                      alt={`${notification.person1}'s profile`}
                    ></img>
                    <div className='text-md mr-2 leading-none'>
                      <span className='font-medium text-lg mr-1'>{notification.person1}</span>
                      {''}
                      started following you!
                    </div>
                  </div>
                </div>
                <div className='w-full h-[2px] bg-gray-300'></div>
              </div>
            );
          } else if (notification.person2 === username && notification.id === 'like') {
            // console.log(notification)
            return (
              <div
                // key={notification.id} // Ensure each element has a unique key
                onClick={() =>
                  navigateToProfile({
                    usernames: [notification.person1, notification.person2],
                  })
                }
                className='bg-stone-100 rounded-md'
               rounded-md>
                <div className='flex'>
                  <div className='flex flex-row ml-2 h-[4.5rem] items-center space-x-2'>
                    <img
                      src={`data:image/png;base64,${notification.person1_profile}`}
                      className='w-[3.5rem] h-[3.5rem] rounded-full'
                      alt={`${notification.person1}'s profile`}
                    ></img>
                    <div className='text-md mr-2 leading-none'>
                      <span className='font-medium text-lg mr-1'>{notification.person1}</span>
                      {''}
                      liked your post!
                    </div>
                  </div>
                </div>
                <div className='w-full h-[2px] bg-gray-300'></div>
              </div>
            );
          } else if (notification.person2 === username && notification.id === 'comment') {
            return (
              <div
                // key={notification.id} // Ensure each element has a unique key
                onClick={() =>
                  navigateToProfile({
                    usernames: [notification.person1, notification.person2],
                  })
                }
                className='bg-stone-100 rounded-md'
               rounded-md>
                <div className='flex'>
                  <div className='flex flex-row ml-2 h-[4.5rem] items-center space-x-2'>
                    <img
                      src={`data:image/png;base64,${notification.person1_profile}`}
                      className='w-[3.5rem] h-[3.5rem] rounded-full'
                      alt={`${notification.person1}'s profile`}
                    ></img>
                    <div className='text-md mr-2 leading-none'>
                      <span className='font-medium text-lg mr-1'>{notification.person1}</span>
                      {''}
                      commented on your post!
                    </div>
                  </div>
                </div>
                <div className='w-full h-[2px] bg-gray-300'></div>
              </div>
            );
          } else if (notification.person2 === username && notification.id === 'commentlike') {
            // console.log(notification)
            return (
              <div
                // key={notification.id} // Ensure each element has a unique key
                onClick={() =>
                  navigateToProfile({
                    usernames: [notification.person1, notification.person2],
                  })
                }
                className='bg-stone-100 rounded-md'
               rounded-md>
                <div className='flex'>
                  <div className='flex flex-row ml-2 h-[4.5rem] items-center space-x-2'>
                    <img
                      src={`data:image/png;base64,${notification.person1_profile}`}
                      className='w-[3.5rem] h-[3.5rem] rounded-full'
                      alt={`${notification.person1}'s profile`}
                    ></img>
                    <div className='text-md mr-2 leading-none'>
                      <span className='font-medium text-lg mr-1'>{notification.person1}</span>
                      {''}
                      liked your comment!
                    </div>
                  </div>
                </div>
                <div className='w-full h-[2px] bg-gray-300'></div>
              </div>
            );
          } else if (notification.person2 === username && notification.id === 'commentreply') {
            // console.log(notification)
            return (
              <div
                // key={notification.id} // Ensure each element has a unique key
                onClick={() =>
                  navigateToProfile({
                    usernames: [notification.person1, notification.person2],
                  })
                }
                className='bg-stone-100 rounded-md'
               rounded-md>
               <div className='flex'>
                  <div className='flex flex-row ml-2 h-[4.5rem] items-center space-x-2'>
                    <img
                      src={`data:image/png;base64,${notification.person1_profile}`}
                      className='w-[3.5rem] h-[3.5rem] rounded-full'
                      alt={`${notification.person1}'s profile`}
                    ></img>
                    <div className='text-md mr-2 leading-none'>
                      <span className='font-medium text-lg mr-1'>{notification.person1}</span>
                      {''}
                      replied to your comment!
                    </div>
                  </div>
                </div>
                <div className='w-full h-[2px] bg-gray-300'></div>
              </div>
            );
          }
          return null;
        })}
      </div>
      <div className='w-full h-[2px] bg-gray-300 '></div>
    </div>
  );
}

export default Notifications;
