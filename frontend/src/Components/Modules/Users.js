import React, { useEffect, useState } from 'react';

const Users = ({ list }) => {
  const [updatedList, setUpdatedList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  // console.log(list);
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
      {/* <input
        type='text'
        placeholder='Search users...'
        value={searchQuery}
        onChange={handleSearchChange}
        className='w-full p-2 mb-2 border border-gray-300 rounded-md'
      />
      {filteredList.map((user) => (
        <div
          key={user.user_name}
          className='flex mx-3 my-2 shadow-md border rounded-md bg-white p-2 items-center'
        >
          <img
            src={`data:image/png;base64,${user.profile}`}
            className='h-12 w-12'
            alt='User Profile'
          />
          <div className='ml-3 w-full text-xl font-light'>{user.user_name}</div>
        </div>
      ))} */}
      <div
        className='flex flex-col flex-col-wrap lg:h-full md:h-full overflow-y-scroll space-y-6'
        style={{ height: 'auto', maxHeight: '100%' }}
      >
        <div className='flex w-full max-w-sm items-center space-x-1'>
          <input
            className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
            placeholder='Search'
            type='search'
          />
          <button className='inline-flex text-white bg-black items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-12'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='h-4 w-4'
            >
              <circle cx='11' cy='11' r='8' />
              <path d='m21 21-4.3-4.3' />
            </svg>
            <span className='sr-only'>Search</span>
          </button>
        </div>
        <div className='space-y-2.5'>
          {filteredList.map((user) => (
            <div className='flex flex-col'>
              <div
                key={user.user_name}
                className='flex flex-row w-full bg-stone-100 rounded-md p-2 items-center justify-between'
              >
                <div className='flex space-x-2'>
                  <img
                    src={`data:image/png;base64,${user.profile}`}
                    className='h-[3rem] w-[3rem] rounded-full'
                    alt={`${user.user_name}'s profile`}
                  />
                  <div className='text-lg py-3'>{user.user_name}</div>
                </div>
              </div>
              <div className='w-full h-[2px] bg-gray-300'></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Users;
