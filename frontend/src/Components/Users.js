import React, { useEffect, useState } from 'react';

const Users = ({ list }) => {
  const [updatedList, setUpdatedList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Function to handle changes in the search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter users based on search query
  const filteredList = updatedList.filter((user) =>
    user.user_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const fetchProfileImage = async (username1) => {
    try {
      const body = { username1 };
      const response = await fetch('http://localhost:3001/fetchImage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      return result.imageContent;
    } catch (err) {
      console.error('Error fetching image:', err.message);
    }
  };

  useEffect(() => {
    const fetchProfileImages = async () => {
      const updatedListWithImages = await Promise.all(
        list.map(async (user) => {
          return {
            ...user,
            profile: await fetchProfileImage(user.user_name),
          };
        }),
      );
      // Update the state with the new list containing profile images
      setUpdatedList(updatedListWithImages);
    };
    fetchProfileImages();
  }, [list]);

  return (
    <div className='w-full h-full'>
      {/* Search bar */}
      <input
        type='text'
        placeholder='Search users...'
        value={searchQuery}
        onChange={handleSearchChange}
        className='w-full p-2 mb-2 border border-gray-300 rounded-md'
      />

      <div className='h-[2px] w-[92%] ml-3 -mt-3 mb-2 bg-stone-300'></div>

      {/* Display filtered list of users */}
      {filteredList.map((user) => (
        <div
          key={user.user_name}
          className='flex mx-3 my-1.5 border-2 border-sky-300 rounded-md bg-white p-2 items-center'
        >
          <img
            src={`data:image/png;base64,${user.profile}`}
            className='h-12 w-12'
            alt='User Profile'
          />
          <div className='ml-3 w-full text-xl font-light'>{user.user_name}</div>
        </div>
      ))}
    </div>
  );
};

export default Users;
