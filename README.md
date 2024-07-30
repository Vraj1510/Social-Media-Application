# Connecta 🌐

Connecta is a robust social media application that integrates modern web technologies to provide a seamless user experience. With features like authentication, posts, interactions, friend requests, and a chat module similar to WhatsApp, Connecta is designed to bring people closer together.

## Features

- **Authentication**: Secure user login and registration with token-based authentication.
- **Posts**: Users can create, edit, and delete posts. They can also like and comment on posts.
- **Interactions**: Users can interact with each other's posts through likes and comments.
- **Friend Requests**: Send and accept friend requests to connect with other users.
- **Chat Module**: Real-time chat functionality similar to WhatsApp.

## Technology Stack

- **Front-end**: ReactJS
- **Back-end**: NodeJS
- **Database**: PostgreSQL

## Installation

To run Connecta locally, follow these steps:

### Prerequisites

Ensure you have the following installed:
- Node.js
- PostgreSQL
- Git

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vraj1510/Connecta.git
   cd Connecta


2. **Set up the backend:**
   - Navigate to the backend directory:
     ```bash
     cd backend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Configure the database connection in `config.js` with your PostgreSQL credentials.
   - Run database migrations:
     ```bash
     npm run migrate
     ```
   - Start the backend server:
     ```bash
     npm start
     ```

3. **Set up the frontend:**
   - Navigate to the frontend directory:
     ```bash
     cd ../frontend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the frontend development server:
     ```bash
     npm start
     ```

The application should now be running locally. Open your browser and navigate to `http://localhost:3000`.

## Usage

### Authentication

Users can register for a new account or log in with their existing credentials. Passwords are securely hashed and stored in the database.

### Posts

Users can create new posts, edit their existing posts, and delete posts they no longer want to share. They can also like and comment on posts to engage with other users.

### Interactions

Engage with posts through likes and comments. See how many likes a post has and read through the comments to join the conversation.

### Friend Requests

Search for users and send friend requests to connect. Accept incoming friend requests to build your network.

### Chat Module

Real-time chat functionality allows users to send messages to their friends. This feature is designed to mimic the experience of using WhatsApp.

## Database Schema

The PostgreSQL database schema is designed for efficient data storage and retrieval. Key tables include:
- `Users`: Stores user information.
- `Posts`: Stores posts created by users.
- `Comments`: Stores comments on posts.
- `Friends`: Manages friend relationships between users.
- `Messages`: Stores chat messages.

## Security

- **Authentication**: Implemented using JWT tokens to ensure secure access.
- **Authorization**: Middleware functions ensure users can only access their own data.
- **Encryption**: Sensitive data like passwords are encrypted using industry-standard hashing algorithms.


<img width="502" alt="Screenshot 2024-07-30 at 11 15 49 PM" src="https://github.com/user-attachments/assets/b6eb9386-5a45-48ec-8a38-2c874aff416c">




<img width="493" alt="Screenshot 2024-07-30 at 11 15 55 PM" src="https://github.com/user-attachments/assets/3114c0c5-06f2-4abc-9e2c-d6a3d804580b">




<img width="463" alt="Screenshot 2024-07-30 at 11 17 08 PM" src="https://github.com/user-attachments/assets/965e5c6c-1837-482b-81db-4dbcea4dddc4">




<img width="493" alt="Screenshot 2024-07-30 at 11 17 29 PM" src="https://github.com/user-attachments/assets/3ed77f93-793a-498c-ab05-49d57ce63148">




<img width="1470" alt="Screenshot 2024-07-30 at 11 45 44 PM" src="https://github.com/user-attachments/assets/0c598df4-079a-4b6c-9dcb-95afd31f7961">




<img width="977" alt="Screenshot 2024-07-30 at 11 46 09 PM" src="https://github.com/user-attachments/assets/9ca82743-713b-45d6-9dda-65568ddb744e">




<img width="978" alt="Screenshot 2024-07-30 at 11 46 17 PM" src="https://github.com/user-attachments/assets/d0e945a9-56a3-478b-82fe-1451bad31bc7">




<img width="1470" alt="Screenshot 2024-07-30 at 11 46 36 PM" src="https://github.com/user-attachments/assets/d0bced7a-7aed-4b9c-bfa3-01187e70ba2a">




<img width="478" alt="Screenshot 2024-07-30 at 11 46 50 PM" src="https://github.com/user-attachments/assets/c5808162-a18b-4bb5-b385-41221c051925">




<img width="477" alt="Screenshot 2024-07-30 at 11 47 02 PM" src="https://github.com/user-attachments/assets/a625db04-595a-4732-b3cc-2605039149eb">




<img width="453" alt="Screenshot 2024-07-30 at 11 47 27 PM" src="https://github.com/user-attachments/assets/0e4b0627-d657-4f6e-81df-b33d1e9666aa">




<img width="449" alt="Screenshot 2024-07-30 at 11 47 36 PM" src="https://github.com/user-attachments/assets/3e6e548d-922c-4687-80ca-61cbb094c9dd">




<img width="1470" alt="Screenshot 2024-07-30 at 11 48 01 PM" src="https://github.com/user-attachments/assets/bdf542a4-0999-4344-8dd4-1b509fcaf022">




<img width="1463" alt="Screenshot 2024-07-30 at 11 48 29 PM" src="https://github.com/user-attachments/assets/f36857bb-6e02-45f7-98be-9e2ec6872869">




## Contributing

Contributions are welcome! If you have any ideas, suggestions, or improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- The developers and contributors of ReactJS, NodeJS, and PostgreSQL.
- The open-source community for providing valuable resources and tools.

---
