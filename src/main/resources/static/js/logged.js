const image = document.getElementById("image1");
const postInput = document.getElementById("postInput");
const makePost = document.getElementsByClassName("make-post")[0];
let loggedUser;

document.addEventListener("DOMContentLoaded", async () => {
    loggedUser = await getUserInfo();
    const username = loggedUser.username;
    await getAllUsers();
    await getAllPosts(loggedUser.id);
    postInput.placeholder = `Hello, ${username}! What's on your mind today?`;
    try {
        const response = await fetch(`/api/getProfilePhoto?username=${username}`);
        const path = await response.text();
        console.log(path);
        image.src = path;
    } catch (error) {
        console.error(error);
    }
});

async function getUserInfo() {
    try {
        const response = await fetch ('/api/getUser');
        if (!response.ok) {
            throw new Error("Failed to fetch the user");
        }
        const user = await response.json();
        return {
            username: user.username,
            id: user.id
        };
    } catch (error) {
        console.error(error);
    }
}

async function getAllUsers() {
    const response = await fetch("/api/getUsers");
    const users = await response.json();
    const usersContainer = document.querySelector(".users");
    const loggedUsername = window.location.pathname.split("/")[1];

    const senderId = loggedUser.id;
    for (const user of users) {
        if (user.username !== loggedUsername) {
            const userBox = document.createElement("div");
            userBox.className = "user-box";

            const imageContainer = document.createElement("div");
            imageContainer.classList.add("image-container");

            const textContainer = document.createElement("div");
            textContainer.classList.add("text-container");

            const buttonContainer = document.createElement("div");
            buttonContainer.classList.add("button-container");

            const receiverId = user.id;

            const photoUrl = await getProfilePhoto(user.username);
            const userImage = document.createElement("img");
            userImage.src = photoUrl;
            userImage.className = "user-image";
            imageContainer.appendChild(userImage);

            const userText = document.createElement("div");
            textContainer.appendChild(userText);
            userText.className = "user-text";
            userText.innerHTML = user.username;

            usersContainer.appendChild(userBox);
            userBox.appendChild(imageContainer);
            userBox.appendChild(textContainer);
            userBox.appendChild(buttonContainer);

            if (!(await checkRequest(senderId, receiverId))) {
                const button = document.createElement("button");
                buttonContainer.appendChild(button);
                button.innerHTML = "Add friend";
                button.classList.add("friend-button");

                button.addEventListener("click", async () => {
                    try {
                        const response = await fetch("/api/sendFriendRequest", {
                            method: "POST",
                            headers: {"Content-type": "application/json"},
                            body: JSON.stringify({senderId: senderId, receiverId: receiverId})
                        });
                        const result = await response.text();
                        if (result === "Success") {
                            button.remove();
                        }
                    } catch (error) {
                        console.error(error);
                    }
                });
            }
        }
    }
    return users;
}

async function getProfilePhoto(username) {
    try {
        const response = await fetch (`/api/getProfilePhoto?username=${username}`);
        return await response.text();
    } catch (error) {
        console.error(error);
    }
}

image.addEventListener("click", async () => {
    const username = loggedUser.username;
    console.log("here");
    window.location.href = `/${username}/profile`;
});

postInput.addEventListener("focus", () => {
    makePost.classList.add("expanded");
    postInput.style.height = "50%";
    image.style.display = "none";
    const existsButton = document.querySelector(".button-container1");
    if (!existsButton) {
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container1");
        const button = document.createElement("button");
        buttonContainer.appendChild(button);
        button.innerHTML = "Post";
        makePost.appendChild(buttonContainer);

        button.addEventListener("click", async () => {
            if (postInput.value === "") {
                alert("Post field is empty!");
            } else {
                await savePost();
                if (!isWebSocketConnected) {
                    deletePosts();
                    await getAllPosts(loggedUser.id);
                }
                const feed = document.querySelector('.feed');
                feed.scrollTop = 0;
            }
        });
    }
});

document.addEventListener("click", async (event) => {
    if (!makePost.contains(event.target) && postInput !== document.activeElement) {
        retractMakePost();
    }
});

function retractMakePost() {
    makePost.classList.remove("expanded");
    postInput.classList.remove("expanded");
    image.style.display = "block";
    const button = document.querySelector(".button-container1");
    if (button) {
        button.remove();
    }
}

function getCurrentTime() {
    const now = new Date();

    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');  // Months are 0-based
    const year = now.getFullYear();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}


let isWebSocketConnected = false;
const socket = new SockJS('/websocket');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function(frame) {
    console.log('Connected: ' + frame);
    isWebSocketConnected = true; // Mark WebSocket as connected
    stompClient.subscribe('/topic/reloadFriendshipButton', async function () {
        deleteUsers();
        setTimeout(async () => {
            await getAllUsers();
        }, 200);  // Add a slight delay to allow DOM updates to complete
    });

    stompClient.subscribe('/topic/reload', async function () {
        deletePosts();
        setTimeout(async () => {
            await getAllPosts(loggedUser.id);
        }, 200);  // Add a slight delay to allow DOM updates to complete
    });
}, function(error) {
    console.error('WebSocket connection error:', error);
    isWebSocketConnected = false;
});

async function savePost() {
    const userInfo = await getUserInfo();
    const userId = userInfo.id;
    const authorUsername = userInfo.username;
    const content = postInput.value;
    const postTime = getCurrentTime();

    try {
        const response = await fetch("/api/savePost", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({ userId: userId, authorUsername: authorUsername, content: content, postTime: postTime })
        });
        const status = await response.text();
        if (status === "Success") {
            postInput.value = ""; // Clear the input field
            retractMakePost(); // Hide the post creation UI
        }
    } catch (error) {
        console.error(error);
    }
}

async function getAllPosts(userId) {
    try {
        const response = await fetch(`/api/getAllPosts?userId=${userId}`);
        const posts = await response.json();
        if (!response.ok) {
            throw new Error("HTTP error");
        }
        for (let i = posts.length - 1; i >= 0; i--) {
            await generatePostCard(posts[i]);
        }
    } catch (error) {
        console.error(error);
    }
}

async function generatePostCard(post) {
    const postCard = document.createElement("div");
    postCard.classList.add("post-card");

    const postHeader = document.createElement("div");
    postHeader.classList.add("post-header");

    const userInfo = document.createElement("div");
    userInfo.classList.add("user-info");

    const userPhoto = document.createElement("img");
    userPhoto.classList.add("user-photo");
    const path = await getProfilePhoto(post.authorUsername);
    userPhoto.src = path;
    userPhoto.alt = "User Photo";

    const username = document.createElement("span");
    username.classList.add("username");
    username.textContent = post.authorUsername;

    userInfo.appendChild(userPhoto);
    userInfo.appendChild(username);

    const postDate = document.createElement("span");
    postDate.classList.add("post-date");
    postDate.textContent = post.postTime;

    postHeader.appendChild(userInfo);
    postHeader.appendChild(postDate);

    const postContent = document.createElement("div");
    postContent.classList.add("post-content");
    postContent.textContent = post.content;

    postCard.appendChild(postHeader);
    postCard.appendChild(postContent);

    document.querySelector(".feed").appendChild(postCard);
}

function deletePosts() {
    const posts = document.querySelectorAll(".post-card");
    posts.forEach(post => {
        post.remove();
    });
}

function deleteUsers() {
    const users = document.querySelectorAll(".user-box");
    users.forEach(user => {
        user.remove();
    });
}

async function checkRequest(senderId, receiverId) {
    try {
        const response = await fetch(`/api/checkRequest?senderId=${senderId}&receiverId=${receiverId}`);
        const result = await response.text();
        return result === "True";

    } catch(error) {
        console.error(error);
    }
}