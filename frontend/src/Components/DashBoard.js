import React from 'react';
import followingimg from '../Images/following.png';
import followersimg from '../Images/followers.png';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Notifications from './Notifications';
import Followers from './Following';
import Following from './Followers';
import DashBoardPosts from './DashboardPosts';
import PYMK from './PYMK';
import Sidebar from './Sidebar';
import { io } from 'socket.io-client';
import { useIndex } from './IndexContext';

const socket = io.connect(
  'http://localhost:3001',
  // { connectionStateRecovery: {} },
  { autoConnect: false },
);
function DashBoard() {
  const navigate = useNavigate();
  const { index } = useIndex();
  const { state } = useLocation();
  const { updateUsername } = useIndex();
  const [username, setUsername1] = useState();
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  useEffect(() => {
    const disableBackButton = (event) => {
      event.preventDefault();
      return false;
    };

    // Disable the back button
    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener('popstate', disableBackButton);

    return () => {
      // Re-enable the back button when the component unmounts
      window.removeEventListener('popstate', disableBackButton);
    };
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
          setUsername1(result.username);
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
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return (
    <div
      className={`flex  ${
        isSmallScreen ? 'flex-col ' : 'flex-row'
      } w-screen h-screen lg:justify-between `}
    >
      {!isSmallScreen && <Sidebar username={username} index={0}></Sidebar>}
      {index < 2 ? (
        <DashBoardPosts username={username}></DashBoardPosts>
      ) : (
        isLargeScreen && <DashBoardPosts username={username}></DashBoardPosts>
      )}
      {isLargeScreen && <PYMK username={username}></PYMK>}
      {isSmallScreen && <Sidebar username={username} index={0}></Sidebar>}
    </div>
  );
}
export default DashBoard;
export { socket };
