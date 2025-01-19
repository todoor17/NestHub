const profilePicture = document.getElementById("profilePicture");
const name = document.getElementsByClassName("name")[0];

const friendsDiv = document.getElementsByClassName("friends")[0];
const friendRequestsDiv = document.getElementsByClassName("requests")[0];

document.addEventListener("DOMContentLoaded", async () => {
    const user = await getUserInfo();
    await setProfilePicture();
    await loggedUserProfile(user);
    await getPosts();
    await getUserInfo();
    await getPendingRequests();
    await getFriends();
    await getNrOfFriends(user);

    const socket = new SockJS("/websocket");
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, function() {
        stompClient.subscribe("/topic/reloadFriendshipButton", async () => {
            window.location.reload();
        });
    });
});

async function loggedUserProfile(user) {
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container1");

    const changeProfilePicture = document.createElement('input');
    changeProfilePicture.type = 'file';
    changeProfilePicture.id = 'fileInput';
    changeProfilePicture.classList.add('hidden-file-name');

    const label = document.createElement('label');
    label.setAttribute('for', 'fileInput');
    label.classList.add('custom-button');
    label.textContent = 'Change picture';

    buttonContainer.appendChild(changeProfilePicture);
    buttonContainer.appendChild(label);

    const logOutButton = document.createElement("button");
    logOutButton.classList.add("delete-account");
    logOutButton.style.border = "3px solid black";
    logOutButton.innerHTML = "Logout";
    buttonContainer.appendChild(logOutButton);

    logOutButton.addEventListener("click", async () => {
        try {
            const response = await fetch("/logout", {
                method: "GET",
                credentials: "include"
            });

            if (response.ok) {
                window.location.href = "/login";
            } else {
                console.error(response.status);
            }
        } catch(error) {
            console.error(error);
        }
    });


    changeProfilePicture.addEventListener("change", async () => {
        const photo = changeProfilePicture.files[0];
        const formData = new FormData();
        formData.append("photo", photo);
        console.log(photo.name);
        try {
            const response = await fetch("/api/uploadPhoto", {
                method: "POST",
                body: formData
            });
            const data = await response.text();
            console.log(data);

            await setProfilePicture();
        } catch (error) {
            console.error(error);
        }
    });

    const deleteAccountButton = document.createElement("button");
    deleteAccountButton.innerHTML = "Delete profile";
    buttonContainer.appendChild(deleteAccountButton);
    deleteAccountButton.classList.add("delete-account");

    deleteAccountButton.addEventListener("click", async () => {
        const modal = document.querySelector(".modal");
        modal.classList.add("show");

        const confirmButton = document.getElementById("confirm");
        const cancelButton = document.getElementById("cancel");

        const userId = user.id;
        await deleteUser(confirmButton, userId);

        cancelButton.addEventListener("click", () => {
            modal.classList.remove("show");
        });
    })

    const right = document.querySelector(".right");
    right.appendChild(buttonContainer);
}

function deleteUser(confirmButton, userId) {
    confirmButton.addEventListener("click", async () => {
        const password = document.getElementById("passwordInput");
        const passwordValue = password.value;
        try {
            const response = await fetch(`/api/deleteUser`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ password: passwordValue, userId: userId })
            });
            const result = await response.text();
            if (result === "User deleted successfully") {
                alert("Your account was deleted. Thank you for your contribution!");
                window.location.href = "/login";
            } else {
                password.value = "";
                alert("Introduced password is wrong");
            }
        } catch (error) {
            console.error(error);
        }
    });
}

async function setProfilePicture() {
    const username = window.location.pathname.split("/")[1];
    try {
        const response = await fetch(`/api/getProfilePhoto?username=${username}`);
        profilePicture.src = await response.text();
    } catch (error) {
        console.error("Error fetching profile picture:", error);
    }
}

async function getPosts() {
    const username = window.location.pathname.split("/")[1];
    try {
        const response = await fetch(`/api/getPostsByUsername?username=${username}`);
        const posts = await response.json();
        console.log(posts);
        for (let i = posts.length - 1; i >= 0; i--) {
            generatePostCard(posts[i]);
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
    const loggedUser = await getUserInfo();
    const imagePath = await getProfilePhoto(loggedUser.username);
    console.log(imagePath)
    userPhoto.src =  imagePath;
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

async function getUserInfo() {
    try {
        const response = await fetch("/api/getUser");
        const user = await response.json();
        name.innerHTML = user.firstName + " " + user.lastName;
        return user;
    } catch (error) {
        console.error(error);
    }
}

async function getPendingRequests() {
    const userId = (await getUserInfo()).id;
    console.log(userId);
    try {
        const response = await fetch(`/api/getPendingRequests?receiverId=${userId}`);
        const users = await response.json(); // users that sent friend requests

        await generateUserBoxes(users, friendRequestsDiv);
    } catch (error) {
        console.error(error);
    }
}

async function generateUserBoxes(users, type) {
    for (const user of users) {
        const userBox = document.createElement("div");
        userBox.className = "user-box";

        const userImageContainer = document.createElement("div");
        userImageContainer.className = "image-container";

        const textContainer = document.createElement("div");
        textContainer.classList.add("text-container");

        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container");

        const photoUrl = await getProfilePhoto(user.username);
        const userImage = document.createElement("img");
        userImage.src = photoUrl;
        userImage.className = "user-image";
        userImageContainer.appendChild(userImage);

        const userText = document.createElement("div");
        userText.className = "user-text";
        userText.innerHTML = user.username;
        textContainer.appendChild(userText);

        const senderId = user.id;
        const receiverId = (await getUserInfo()).id;

        // Append containers to userBox
        type.appendChild(userBox);
        userBox.appendChild(userImageContainer);
        userBox.appendChild(textContainer);
        userBox.appendChild(buttonContainer);  // Ensure button container is added to the box

        if (type === friendRequestsDiv) {
            const acceptButton = document.createElement("button");
            acceptButton.innerHTML = "✔";
            acceptButton.classList.add("friend-button");

            acceptButton.addEventListener("click", async () => {
                await acceptRequest(senderId, receiverId);
                await refreshRequestsAndFriends(users, friendRequestsDiv, senderId);
            });

            const denyButton = document.createElement("button");
            denyButton.classList.add("friend-button");

            const buttonImage2 = document.createElement("img");
            buttonImage2.classList.add("button-image");
            buttonImage2.src = "/images/delete.png";
            denyButton.appendChild(buttonImage2);

            denyButton.addEventListener("click", async () => {
                try {
                    const response = await fetch("/api/deleteRequest", {
                        method: "POST",
                        headers: { "Content-type": "application/json" },
                        body: JSON.stringify({ senderId: senderId, receiverId: receiverId })
                    });
                    await refreshRequestsAndFriends(users, friendRequestsDiv, senderId);
                } catch (error) {
                    console.error(error);
                }
            });

            // Append buttons to button container
            buttonContainer.appendChild(acceptButton);
            buttonContainer.appendChild(denyButton);
        } else if (type === friendsDiv) {
            const messageButton = document.createElement("button");
            messageButton.classList.add("friend-button");

            const buttonImage = document.createElement("img");
            buttonImage.classList.add("button-image");
            buttonImage.src = "/images/messageIcon.png";
            messageButton.appendChild(buttonImage);

            messageButton.addEventListener("click", async () => {
                const loggedUser = await getUserInfo();
                const senderId = loggedUser.id;
                const myUsername = loggedUser.username;
                const receiverId = user.id;
                console.log(senderId + " " + receiverId);
                window.location.href = `/chat?senderId=${senderId}&receiverId=${receiverId}&friendUsername=${user.username}&myUsername=${myUsername}`;
            });

            const removeButton = document.createElement("button");
            removeButton.classList.add("friend-button");

            const buttonImage1 = document.createElement("img");
            buttonImage1.classList.add("button-image");
            buttonImage1.src = "/images/delete.png";
            removeButton.appendChild(buttonImage1);

            removeButton.addEventListener("click", async () => {
                try {
                    const response = await fetch("/api/deleteFriend", {
                        method: "POST",
                        headers: { "Content-type": "application/json" },
                        body: JSON.stringify({ senderId: senderId, receiverId: receiverId })
                    });
                    if (response.ok) {
                        socket.send("/topic/reloadFriendshipButton", "delete");
                        await refreshRequestsAndFriends(users, friendsDiv, senderId);
                        const updatedUser = await getUserInfo();
                        await getNrOfFriends(updatedUser);
                    }
                } catch (error) {
                    console.error(error);
                }
            });

            // Append buttons to button container
            buttonContainer.appendChild(messageButton);
            buttonContainer.appendChild(removeButton);
        }
    }
}

async function getProfilePhoto(username) {
    try {
        const response = await fetch (`/api/getProfilePhoto?username=${username}`);
        return await response.text();
    } catch (error) {
        console.error(error);
    }
}

async function acceptRequest(senderId, receiverId) {
    try {
        const response = await fetch ("/api/acceptRequest", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify( { sender: senderId, receiver: receiverId })
        });
        const result = await response.text();
        const updatedUser = await getUserInfo();
        await getNrOfFriends(updatedUser);
        return result;
    } catch (error) {
        console.error(error);
    }
}

async function getFriends() {
    const loggedUserId = (await getUserInfo()).id;
    try {
        const response = await fetch(`/api/getFriends?loggedUserId=${loggedUserId}`);
        const users = await response.json();
        console.log(users);
        await generateUserBoxes(users, friendsDiv);
    } catch (error) {
        console.error(error);
    }
}

async function refreshRequestsAndFriends(users, type, senderId) {
    const userBoxes = document.querySelectorAll(".user-box");
    for (const userBox of userBoxes) {
        userBox.remove();
    }
    if (type === friendRequestsDiv) {
        await getPendingRequests(); // Refresh pending requests
        await getFriends();
    } else if (type === friendsDiv) {
        await getFriends(); // Refresh friends list
    }
}

async function getNrOfFriends(user) {
    const userId = user.id;
    const nrOfFriends = document.getElementsByClassName("friends-count")[0];
    try {
        const response = await fetch(`/api/getNrOfFriends?userId=${userId}`);
        const result = await response.text();
        if (result === '1') {
            nrOfFriends.innerHTML = result + " " + "friend";
        } else {
            nrOfFriends.innerHTML = result + " " + "friends";
        }
    } catch (error) {
        console.error(error);
    }
}
