import React from 'react';
import { BrowserRouter as  Route, Routes } from 'react-router-dom';
import SignUp from './Components/SignUp';
import Login from './Components/Login';
import Dashboard from './Components/DashBoard';
import Profile from './Components/Profile';
import Profile1 from './Components/Profile1';
import OTP from './Components/OTP';
import ChatHome from './Components/ChatHome';
import Router from './routes';
import { IndexProvider } from './Components/IndexContext';
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
