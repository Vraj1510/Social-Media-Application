import { Suspense, lazy } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import React from 'react';
import { BrowserRouter as Route, Routes } from 'react-router-dom';
import SignUp from '../Components/Auth/SignUp';
import Login from '../Components/Auth/Login';
import Dashboard from '../Components/Home/DashBoard';
import Profile from '../Components/Home/Profile';
import Profile1 from '../Components/Home/Profile1';
import OTP from '../Components/Auth/OTP';
import ChatHome from '../Components/Chats/ChatHome';
import Page404 from '../Components/Page404/Page404';
import ForgotPassword from '../Components/Auth/ForgotPassword';
import { IndexProvider } from '../Components/IndexContext/IndexContext';
import ResetPassword from '../Components/Auth/ResetPassword';
import EditProfile from '../Components/Home/EditProfile';
// import EditP
// function App() {
//   return (
//     <div className='app'>
//       <IndexProvider>
//         <Routes>
//           <Route path='/' element={<Login />} />
//           <Route path='/signup' element={<SignUp />} />
//           <Route path='/dashboard' element={<Dashboard />} />
//           <Route path='/profile' element={<Profile />} />
//           <Route path='/profile1' element={<Profile1 />} />
//           <Route path='/otp' element={<OTP />} />
//           <Route path='/chathome' element={<ChatHome />} />
//         </Routes>
//       </IndexProvider>
//     </div>
//   );
// }

// export default App;
// const Login = Loadable(lazy(() => import('../Components/Login')));
// const SignUp = Loadable(lazy(() => import('../Components/SignUp')));
// const DashBoard = Loadable(lazy(() => import('../Components/DashBoard')));
// const Profile = Loadable(lazy(() => import('../Components/Profile')));
// const Profile1 = Loadable(lazy(() => import('../Components/Profile1')));
// const OTP = Loadable(lazy(() => import('../Components/OTP')));
// const ChatHome = Loadable(lazy(() => import('../Components/ChatHome')));
// const Page404 = Loadable(lazy(() => import('../Components/Page404')));
export default function Router() {
  return useRoutes([
    // Define the default route as '/auth'
    { path: '/', element: <Navigate to='/app' /> },
    {
      path: '/auth',
      children: [
        { path: '', element: <Login /> },
        { path: 'signup', element: <SignUp /> },
        { path: 'otp', element: <OTP /> },
        { path: 'forgotpassword', element: <ForgotPassword /> },
        { path: 'resetpassword/:id/:token', element: <ResetPassword /> },
        { path: '404', element: <Page404 /> },
        { path: '*', element: <Navigate to='/404' replace /> },
      ],
    },
    {
      path: '/app',
      children: [
        { path: '', element: <Dashboard /> },
        { path: 'profile', element: <Profile /> },
        { path: 'profile1', element: <Profile1 /> },
        { path: 'chathome', element: <ChatHome /> },
        { path: 'editprofile', element: <EditProfile /> },
        { path: '404', element: <Page404 /> },

        { path: '*', element: <Navigate to='/404' replace /> },
      ],
    },

    // Define the '404' route
    { path: '/404', element: <Page404 /> },

    // Define a catch-all route for invalid paths
    { path: '*', element: <Navigate to='/404' replace /> },
  ]);
}
