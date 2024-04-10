import React, { useEffect } from 'react';
import { useState } from 'react';
import addimage from '../Images/add-photo.png';
import minus from '../Images/minus.png';
import { useRef } from 'react';
import { useIndex } from './IndexContext';
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
        className='w-full h-[5rem] text-lg text-cyan-950 p-1 rounded-md shadow-lg  border-4 border-cyan-300'
        onChange={handleCaptionChange}
        value={caption}
      ></textarea>
      <div className='flex flex-wrap'>
        {selectedImages.map((image, index) => (
          <div>
            <img
              src={minus}
              onClick={() => handleImageDelete(index)}
              className='h-6 w-6 mt-2 ml-[12.8rem]'
            />
            <img
              key={index}
              src={isValidBase64(image) ? `data:image/png;base64,${image}` : image}
              className='h-[10rem] w-[13rem] mx-[0.4rem] object-cover rounded-sm cursor-pointer border-2 border-white'
              alt={`Image ${index}`}
            />
          </div>
        ))}
        {selectedImages.length < 10 && (
          <div>
            <img
              src={addimage}
              onClick={() => fileInput.current.click()}
              className='bg-stone-50 h-[10rem] w-[13rem] mx-[0.4rem] mt-8 hover:text-white text-cyan-950 hover:bg-cyan-600 rounded-md'
            />
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
      <div className='flex flex-row w-full'>
        <div className='w-1/6 absolute bottom-4 right-4'>
          <button
            onClick={editPostCall}
            className='bg-white shadow-lg  border-4 border-cyan-300 h-12 w-full hover:text-white text-cyan-950 hover:bg-cyan-950 px-2 py-1 mt-3 rounded-md'
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
export default EditPost;
