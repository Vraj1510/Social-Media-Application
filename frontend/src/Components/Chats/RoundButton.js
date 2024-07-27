import React from 'react';

function RoundedBtn({ icon, onClick, size = '1.8em' }) {
  return (
    <button
      className='text-gray-500  p-2 rounded-full '
      onClick={onClick}
    >
      {React.cloneElement(icon, { size })}
    </button>
  );
}

export default RoundedBtn;
