import React, { useState } from 'react';
import { useRef } from 'react';
import addimage from '../Images/add-photo.png';
import remove from '../Images/remove.png';
import { fetchPost } from './Posts';
import { useIndex } from './IndexContext';
const AddPost = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [posts, setPosts] = useState([]);
  const { username } = useIndex();
  const [currentImageIndex, setCurrentImageIndex] = useState([]);
  const [caption, setCaption] = useState('');
  const [addpost, setaddpost] = useState(false);
  const fileInput = useRef(null);
  const handleCaptionChange = (event) => {
    const caption1 = event.target.value;
    setCaption(caption1);
  };

  const openaddpost = () => {
    setaddpost(!addpost);
  };

  const handleImageDelete = (index) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
  };

  const handlePostImageChange = (e) => {
    const files = e.target.files;
    if (files.length + selectedImages.length > 10) {
      alert('You can only add up to 10 images.');
      return;
    }
    const newImages = Array.from(files).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setSelectedImages([...selectedImages, ...newImages]);
    e.target.value = '';
  };
  const insertPost = async () => {
    try {
      if (selectedImages.length === 0) {
        console.log('No images to upload.');
        return;
      }
      const formdata = new FormData();
      console.log(username);
      var date = new Date();
      formdata.append('username', username);
      formdata.append('caption', caption);
      formdata.append('minutes', date.getMinutes() % 60);
      formdata.append('hours', date.getHours() % 60);
      formdata.append('day', date.getDay());
      formdata.append('date', date.getDate());
      formdata.append('month', date.getMonth());
      formdata.append('year', date.getFullYear());
      var ampm = date.getHours() > 12 ? 'PM' : 'AM';
      formdata.append('ampm', ampm);
      selectedImages.forEach((image, index) => {
        formdata.append('files', image.file);
      });

      const requestOptions = {
        method: 'POST',
        body: formdata,
      };

      const response = await fetch('http://localhost:3001/addpost', requestOptions);

      if (!response.ok) {
        console.error('Error uploading post:', response.status);
        return;
      }

      setSelectedImages([]);
      setaddpost(!addpost);
      console.log('Post uploaded successfully.');
      // window.location.reload(false);
      const fetchData = async () => {
        try {
          const { posts: updatedPosts, currentImageIndex: updatedCurrentImageIndex } =
            await fetchPost(username);
          setPosts(updatedPosts);
          setCurrentImageIndex(updatedCurrentImageIndex);
        } catch (error) {
          console.error('Error fetching posts:', error.message);
        }
      };

      fetchData();
    } catch (error) {
      console.error('Error uploading post:', error.message);
    }
  };
  return (
    <div className='flex items-center'>
      {/* <img
        src={add1}
        onClick={openaddpost}
        className={`h-[3.5rem] pl-1 pr-1 w-20 mt-4 hover:bg-stone-50 ${addpost ? 'div2' : ''}`}
      ></img> */}
      <div className='flex items-center'>
        <button
          onClick={() => {
            openaddpost();
          }}
          className='inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 w-10 h-10'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            stroke-width='2'
            stroke-linecap='round'
            stroke-linejoin='round'
            class='h-6 w-6'
          >
            <path d='M5 12h14'></path>
            <path d='M12 5v14'></path>
          </svg>
        </button>
        <div>Add Post</div>
      </div>
      {addpost && (
        <div className='fixed inset-0 flex justify-center items-center z-50 backdrop-filter backdrop-blur-sm bg-black bg-opacity-50'>
          <div className='flex flex-col rounded-sm space-y-2 bg-stone-100 border-2 p-3 py-4 w-[90%] md:w-[71rem] lg:w-[71rem] h-rounded-md z-50'>
            <textarea
              type='text'
              placeholder='Enter The Caption'
              className='w-full shadow-md text-[16px] placeholder:text-gray-500 bg-white outline-none border p-1 pl-2 rounded-md'
              onChange={handleCaptionChange}
              value={caption}
            ></textarea>
            <div className='flex flex-wrap ml-2.5'>
              {selectedImages.map((image, index) => (
                <div key={index} className='relative'>
                  <img
                    src={remove}
                    onClick={() => handleImageDelete(index)}
                    className='absolute top-1.5 right-2.5 h-4 w-4 z-10 cursor-pointer'
                    alt='Remove'
                  />
                  <img
                    src={image.url}
                    className='h-[10rem] w-[12.7rem] mt-4 mr-[1rem] rounded-md object-cover cursor-pointer'
                    alt={`Image ${index}`}
                  />
                </div>
              ))}
              {selectedImages.length < 10 && (
                <div>
                  {/* <img
                    src={addimage}
                    onClick={() => fileInput.current.click()}
                    className='bg-stone-50 h-[10rem] w-[13rem] mx-[0.4rem] mt-8 hover:text-white text-cyan-950  rounded-md'
                  /> */}
                  <button
                    onClick={() => fileInput.current.click()}
                    class=' h-[10rem] w-[13rem] inline-flex items-center shadow-sm bg-white border mt-4 justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground'
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
              <div className='flex flex-row w-full'>
                <div className='w-3/5 space-x-4 mt-4'>
                  <button
                    onClick={insertPost}
                    className='bg-black text-md text-white h-12 w-1/6 px-2 py-1 mt-3 rounded-md'
                  >
                    Add Post
                  </button>
                  <button
                    onClick={openaddpost}
                    className='bg-white text-md border-2 shadow-md text-black h-12 w-1/6 px-2 py-1 mt-3 rounded-md'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AddPost;
