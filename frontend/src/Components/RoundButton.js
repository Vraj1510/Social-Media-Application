import React from 'react';

function RoundedBtn({ icon, onClick, size = '1.8em' }) {
  return (
    <button
      className='text-[#8796a1] text-xl p-2 rounded-full hover:bg-cyan-950'
      onClick={onClick}
    >
      {React.cloneElement(icon, { size })}
    </button>
  );
}

export default RoundedBtn;
