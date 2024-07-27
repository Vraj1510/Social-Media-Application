import React from 'react';
import { BrowserRouter as Route, Routes } from 'react-router-dom';
import SignUp from './Components/Auth/SignUp';
import Login from './Components/Auth/Login';
import Dashboard from './Components/Home/DashBoard';
import Profile from './Components/Home/Profile';
import Profile1 from './Components/Home/Profile1';
import OTP from './Components/Auth/OTP';
import ChatHome from './Components/Chats/ChatHome';
import Router from './routes';
import { IndexProvider } from './Components/IndexContext/IndexContext';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();
function App() {
  return (
    <div className='app'>
      <QueryClientProvider client={queryClient}>
        <IndexProvider>
          <Router />
        </IndexProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
