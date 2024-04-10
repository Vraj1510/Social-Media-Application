import React, { useState } from 'react';
import { useRef } from 'react';
import addimage from '../Images/add-photo.png';
import remove from '../Images/remove.png';
import { fetchPost } from './Posts';
import { useIndex } from './IndexContext';
const AddPost = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [posts, setPosts] = useState([]);
  const {username}=useIndex();
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
      formdata.append('username', username);
      formdata.append('caption', caption);

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
    <div>
      {/* <img
        src={add1}
        onClick={openaddpost}
        className={`h-[3.5rem] pl-1 pr-1 w-20 mt-4 hover:bg-stone-50 ${addpost ? 'div2' : ''}`}
      ></img> */}
      <button
        onClick={() => {
          openaddpost();
        }}
        className='text-cyan-950 border-2 border-sky-300 w-24 lg:w-28 md:w-28 md:h-[50px] lg:h-[50px] h-10 bg-orange-100 text-lg md:text-xl lg:text-xl rounded-lg md:mt-4 lg:mt-4'
      >
        Add Post
      </button>
      {addpost && (
        <div className='fixed inset-0 flex justify-center items-center z-50 backdrop-filter backdrop-blur-sm bg-black bg-opacity-50'>
          <div className='flex flex-col bg-orange-100 border-2 border-sky-300 p-3 w-[90%] md:w-[71rem] lg:w-[71rem] h-[42rem] rounded-lg z-50'>
            <textarea
              type='text'
              placeholder='Enter The Caption'
              className='w-full text-lg p-1 rounded-md'
              onChange={handleCaptionChange}
              value={caption}
            ></textarea>
            <div className='flex flex-wrap'>
              {selectedImages.map((image, index) => (
                <div>
                  <img
                    src={remove}
                    onClick={() => handleImageDelete(index)}
                    className='h-6 w-6 mt-2 ml-[12.4rem]'
                  />
                  <img
                    key={index}
                    src={image.url}
                    className='h-[10rem] w-[13rem] mx-[0.4rem] object-cover cursor-pointer'
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
            <div className='flex flex-row absolute bottom-[6rem] w-full'>
              <div className='w-3/4 '>
                <button
                  onClick={openaddpost}
                  className='bg-stone-50 h-12 w-1/6 mr-4 hover:text-white text-cyan-950 hover:bg-cyan-600 px-2 py-1 mt-3 rounded-md'
                >
                  Close
                </button>
                <button
                  onClick={insertPost}
                  className='bg-stone-50 h-12 w-1/6 hover:text-white text-cyan-950 hover:bg-cyan-600 px-2 py-1 mt-3 rounded-md'
                >
                  Add Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AddPost;
