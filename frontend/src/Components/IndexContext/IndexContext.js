// IndexContext.js
import React, { createContext, useContext, useState } from 'react';
const IndexContext = createContext();

export const IndexProvider = ({ children }) => {
  console.log(parseInt(localStorage.getItem('index1')));
  console.log(localStorage.getItem('index1'));
  const initialIndex = parseInt(localStorage.getItem('index')) || 0;
  const [index, setIndex] = useState(initialIndex);
  React.useEffect(() => {
    localStorage.setItem('index', index.toString());
  }, [index]);

  const updateIndex = (newIndex) => {
    setIndex(newIndex);
  };

  const initialIndex1 = parseInt(localStorage.getItem('index1'));
  const [index1, setIndex1] = useState(initialIndex1);

  // Update localStorage whenever index changes
  React.useEffect(() => {
    localStorage.setItem('index1', index1.toString());
  }, [index1]);

  const updateIndex1 = (newIndex) => {
    console.log(newIndex);
    setIndex1(newIndex);
  };

  const [resetPassword, setResetPassword] = useState(false);

  const updateResetPassword = (value) => {
    setResetPassword(value);
  };
  const [username, setUsername] = useState('');
  const updateUsername = (value) => {
    setUsername(value);
  };

  const [person2, setPerson2] = useState('');
  const updatePerson2 = (value) => {
    setPerson2(value);
  };
  const [edit, setEdit] = useState(-1);
  const updateEdit = (value) => {
    setEdit(value);
  };

  return (
    <IndexContext.Provider
      value={{
        index,
        updateIndex,
        index1,
        updateIndex1,
        resetPassword,
        updateResetPassword,
        username,
        updateUsername,
        edit,
        updateEdit,
        person2,
        updatePerson2,
      }}
    >
      {children}
    </IndexContext.Provider>
  );
};

export const useIndex = () => useContext(IndexContext);
