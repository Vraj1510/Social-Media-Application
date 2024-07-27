import React, { useEffect } from 'react';
import { useState } from 'react';
import addimage from '../../Images/add-photo.png';
import minus from '../../Images/minus.png';
import { useRef } from 'react';
import { useIndex } from '../IndexContext/IndexContext';
function EditPost({ posts, idx, id }) {
  const fileInput = useRef(null);
  const [selectedImages, setSelectedImages] = useState(posts[idx].pictures);
  const [selectedImagesEdit, setSelectedImagesEdit] = useState(posts[idx].pictures);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth > 768);
  const { username } = useIndex();
  const { updateEdit } = useIndex();
  function isFile(element) {
    return element instanceof File;
  }
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
      if (isSmallScreen) {
      }
    };

    handleResize(); // Call it once to set initial state based on screen size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSmallScreen]);

  const [caption, setCaption] = useState(posts[idx].caption);
  const handleCaptionChange = (event) => {
    const caption1 = event.target.value;
    setCaption(caption1);
  };
  const handleImageDelete = (index) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);

    const newImagesEdit = [...selectedImagesEdit];
    newImagesEdit.splice(index, 1);
    setSelectedImagesEdit(newImagesEdit);
  };
  const handlePostImageChange = async (e) => {
    const files = e.target.files;
    if (files.length + selectedImages.length > 10) {
      alert('You can only add up to 10 images.');
      return;
    }

    const newImages = await Promise.all(
      Array.from(files).map(async (file) => {
        return URL.createObjectURL(file);
      }),
    );
    const newImagesEdit = Array.from(files);
    console.log(newImages);
    console.log(selectedImages);
    setSelectedImages([...selectedImages, ...newImages]);
    setSelectedImagesEdit([...selectedImagesEdit, ...newImagesEdit]);
    console.log(selectedImagesEdit);
    console.log(newImagesEdit);
    e.target.value = '';
  };
  const isValidBase64 = (str) => {
    try {
      // Attempt to decode the string
      atob(str);
      return true;
    } catch (e) {
      return false;
    }
  };

  const editPostCall = async () => {
    try {
      var myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      const formdata = new FormData();
      console.log(username);
      formdata.append('caption', caption);
      formdata.append('id', id);
      formdata.append('length', selectedImagesEdit.length);
      console.log(selectedImagesEdit);
      selectedImagesEdit.forEach((image, idx) => {
        if (isFile(image)) {
          formdata.append(`files`, image, idx); // Assuming image is a file object
        }
      });

      // Print all keys and values of formdata
      for (let pair of formdata.entries()) {
        console.log(pair[0], pair[1]);
      }
      var requestOptions = {
        method: 'POST',
        body: formdata,
      };

      await fetch('http://localhost:3001/editpost', requestOptions)
        .then((response) => response.text())
        .then((result) => console.log(result))
        .catch((error) => console.log('error', error));

      console.log('Post edited successfully.');
      updateEdit(-1);
    } catch (error) {
      console.error('Error uploading post:', error.message);
    }
  };
  return (
    <div>
      <textarea
        type='text'
        placeholder='Enter The Caption'
        className='w-full h-[5rem] text-lg text-cyan-950 p-1 px-2 rounded-md bg-white border border-gray-300'
        onChange={handleCaptionChange}
        value={caption}
      ></textarea>
      <div className='flex flex-wrap w-full mt-5 -ml-0.5 '>
        {selectedImages.map((image, index) => (
          <div className='flex relative mb-5 mr-1'>
            <img
              src={minus}
              onClick={() => handleImageDelete(index)}
              className='h-4 w-4 absolute -left-1 -top-2 ml-[12.8rem]'
            />
            <img
              key={index}
              src={isValidBase64(image) ? `data:image/png;base64,${image}` : image}
              className='h-[10rem] w-[12.7rem] mx-[0.4rem] object-cover rounded-md cursor-pointer'
              alt={`Image ${index}`}
            />
          </div>
        ))}
        {selectedImages.length < 10 && (
          <div className='mb-5'>
            <button
              onClick={() => fileInput.current.click()}
              class=' h-[10rem] w-[12.7rem] inline-flex items-center shadow-sm bg-white border ml-1.5 justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                stroke-width='1.5'
                stroke-linecap='round'
                stroke-linejoin='round'
                class='w-20 h-20 text-gray-500 dark:text-gray-400'
              >
                <path d='M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242'></path>
                <path d='M12 12v9'></path>
                <path d='m16 16-4-4-4 4'></path>
              </svg>
              <span class='sr-only'>Upload image</span>
            </button>
            <input
              type='file'
              ref={fileInput}
              style={{ display: 'none' }}
              multiple
              onChange={handlePostImageChange}
            />
          </div>
        )}
      </div>
      <div className='flex flex-row w-full justify-end'>
        <div className='w-1/6 mr-1.5 mb-1'>
          <button
            onClick={editPostCall}
            className='bg-black shadow-lg h-12 w-full text-white px-2 py-1 mt-3 rounded-md'
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
export default EditPost;
