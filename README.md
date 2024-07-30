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

## Contributing

Contributions are welcome! If you have any ideas, suggestions, or improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- The developers and contributors of ReactJS, NodeJS, and PostgreSQL.
- The open-source community for providing valuable resources and tools.

---
