# Social Media Clone

## Overview

**Nesthub** is a simplified social media platform built with **Spring Boot**, **JPA (Hibernate)**, and **WebSockets**. The platform supports user registration, real-time communication, and interactive features such as sending friendship requests, managing posts, and messaging friends. The name **"Nest"** symbolizes a safe, comforting space where connections can thrive.

---

## Key Features

### 1. User Operations
- **Account Creation**
  - Users create an account by submitting a form.
  - **Validation includes:**
    - No empty fields.
    - Email format verification using regular expressions.
    - Prevention of duplicate emails or usernames (checked via JPA).
- **Login**
  - Users log in with their credentials.
- **Profile Management**
  - Users can upload or change their profile photo.
  - Account deletion is supported (confirmation required).
  - Users can log out.

### 2. Friendship Features
- Send friendship requests to any user.
- Accept or deny incoming friendship requests.
- Remove friends from the friend list.

### 3. Post Management
- Logged-in users can create posts.
- Users can view their posts as well as posts shared by friends.

### 4. Real-Time Messaging
- Users can send and receive messages in real time.
- Both messages and friendship updates are displayed immediately.

### 5. Live Updates via WebSockets
- **WebSockets** are used for instantaneous updates:
  - Friendship requests are updated in real time.
  - New messages appear instantly.
  - Changes to posts or the friend list are reflected immediately.

---

## How It Works

### User Account Creation
1. **Input Validation:**
   - All fields must be completed.
   - Emails are verified using a regular expression.
   - Duplicate emails or usernames are not allowed.
2. **Database Interaction:**
   - Upon successful validation, the user data is saved to the database using JPA.

![Account Creation Screenshot](https://github.com/user-attachments/assets/0f97694e-aa8f-4569-87b5-a73619ff1bc2)  
![Form Validation Screenshot](https://github.com/user-attachments/assets/c25a8c17-9460-4d81-a33f-6847d9b45e17)

---

### Friendship Features
1. A logged-in user can view all other registered users.
2. Friendship requests can be sent to any user.
3. Pending requests are displayed on the profile page for review.
4. Once a friendship is established, users can view friends' posts and exchange messages.

![Friendship Management Screenshot](https://github.com/user-attachments/assets/93c9c25c-59f3-4083-8c09-a3de10228dba)

---

### Profile Page
1. Users can update their profile picture by uploading an image.
2. The profile displays the current number of friends.
3. Account deletion is available (after password confirmation).
4. Friend requests are shown on the profile, allowing for acceptance or rejection.
5. Users can remove friends or send messages directly from the profile.
6. A logout button is available to return to the Login page.

![Profile Page Screenshot](https://github.com/user-attachments/assets/2c0c2a73-a0bc-4319-a6b1-0b64ea31179d)

---

### Messages Page
1. Users can select a friend to start or continue a conversation.
2. Each message displays its sending time.
3. When a user account is deleted, all related messages and interactions (friend requests, posts) are also removed.

![Messages Page Screenshot](https://github.com/user-attachments/assets/ee1bfd8d-a34c-47cc-80cf-640109c2cad5)

---

## Technologies Used

### Spring Boot + JPA (Hibernate)
- **Spring Boot**
  - Simplifies dependency management and application configuration.
  - Provides REST API capabilities for JSON-based communication.
- **Hibernate (JPA)**
  - Manages database interactions.
  - Supports operations such as creating, reading, updating, and deleting records.
  - Handles entities like `User`, `Post`, `Friendship`, and `Message`.
  - Employs custom queries (using JPQL and native SQL) for tasks like:
    - Retrieving messages between users.
    - Checking for existing friendship requests.
    - Fetching all posts associated with a user and their friends.

### WebSockets
- Implemented using **Spring WebSocket**.
- Key functionalities include:
  - Real-time messaging.
  - Instant updates for friend requests and friendship statuses.
- Utilizes STOMP over WebSocket connections for message handling.

### JSON Operations
- REST API endpoints communicate using JSON.
- JSON is used for:
  - User registration data.
  - Friendship requests and message posting.
  - Updating and retrieving posts.
- Spring Boot automatically handles JSON serialization and deserialization.

---

This enhanced README provides a clear and organized overview of the project, its functionality, and the technologies that support its features.
