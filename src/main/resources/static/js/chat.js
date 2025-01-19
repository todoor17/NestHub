const sendButton = document.getElementById("sendButton");
const input = document.getElementById("messageInput");
const friendUsernameElement = document.getElementsByClassName("chat-header")[0];

let userId, friendId;
let friendUsername, myUsername;

document.addEventListener("DOMContentLoaded", async () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    getCurrentTime();

    userId = urlParams.get("senderId");
    friendId = urlParams.get("receiverId");
    friendUsername = urlParams.get("friendUsername");
    myUsername = urlParams.get("myUsername");
    friendUsernameElement.innerHTML = friendUsername;

    await generateConversation();
});

async function getMessages() {
    try {
        const response = await fetch(`/api/getMessages?senderId=${userId}&receiverId=${friendId}`);
        return await response.json();
    } catch (error) {
        console.error(error);
    }
}

async function generateConversation() {
    const chatBox = document.getElementsByClassName("chat-box")[0];
    chatBox.innerHTML = "";  // Clear the chat box to avoid duplication

    const messages = await getMessages();

    const fragment = document.createDocumentFragment();  // Create a fragment to batch append

    for (const message of messages) {
        console.log(message.message);
        let chatElement;
        if (message.senderId == userId && message.receiverId == friendId) {
            chatElement = await createUserChatElement(message);
        } else if (message.senderId == friendId && message.receiverId == userId) {
            chatElement = await createFriendChatElement(message);
        }
        fragment.appendChild(chatElement);  // Add to fragment instead of appending directly
    }
    chatBox.appendChild(fragment);  // Append all at once to avoid DOM misordering
}


async function createFriendChatElement(message) {
    const friendChat = document.createElement('div');
    friendChat.classList.add('friend-chat');

    const messageContainer = document.createElement('div');
    messageContainer.classList.add('chat-message-container');

    const messageTime = document.createElement('div');
    messageTime.classList.add('chat-time', 'friend-time');
    messageTime.textContent = message.sentTime;

    const chatPic = document.createElement('img');
    chatPic.classList.add('chat-pic');
    const imagePath = await getPhoto(friendUsername);
    chatPic.setAttribute('src', imagePath);

    const chatMessage = document.createElement('div');
    chatMessage.classList.add('chat-message');
    chatMessage.textContent = message.message;

    messageContainer.appendChild(chatMessage);
    messageContainer.appendChild(messageTime);

    friendChat.appendChild(chatPic);
    friendChat.appendChild(messageContainer);

    return friendChat;  // Return element to append later
}

async function createUserChatElement(message) {
    const userChat = document.createElement('div');
    userChat.classList.add('user-chat');

    const messageContainer = document.createElement('div');
    messageContainer.classList.add('chat-message-container');

    const messageTime = document.createElement('div');
    messageTime.classList.add('chat-time');
    messageTime.textContent = message.sentTime;

    const chatMessage = document.createElement('div');
    chatMessage.classList.add('chat-message');
    chatMessage.textContent = message.message;

    const chatPic = document.createElement('img');
    chatPic.classList.add('chat-pic');
    const imagePath = await getPhoto(myUsername);
    chatPic.setAttribute('src', imagePath);

    messageContainer.appendChild(messageTime);
    messageContainer.appendChild(chatMessage);

    userChat.appendChild(messageContainer);
    userChat.appendChild(chatPic);

    return userChat;  // Return element to append later
}

async function createUserChatElement(message) {
    const userChat = document.createElement('div');
    userChat.classList.add('user-chat');

    const messageContainer = document.createElement('div');
    messageContainer.classList.add('chat-message-container');

    const messageTime = document.createElement('div');
    messageTime.classList.add('chat-time');
    messageTime.textContent = message.sentTime;

    const chatMessage = document.createElement('div');
    chatMessage.classList.add('chat-message');
    chatMessage.textContent = message.message;

    const chatPic = document.createElement('img');
    chatPic.classList.add('chat-pic');
    const imagePath = await getPhoto(myUsername);
    chatPic.setAttribute('src', imagePath);

    messageContainer.appendChild(messageTime);
    messageContainer.appendChild(chatMessage);

    userChat.appendChild(messageContainer);
    userChat.appendChild(chatPic);

    return userChat;  // Return element to append later
}

function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const currentTime = hours + ":" + minutes + ":" + seconds;
    console.log(currentTime);
    return currentTime;
}

sendButton.addEventListener("click", async () => {
    if (input.value === "") {
        alert("You can't send an empty message");
    } else {
        const message = input.value;
        const time = getCurrentTime();

        try {
            const response = await fetch("/api/sendMessage", {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    senderId: userId,
                    receiverId: friendId,
                    message: message,
                    sentTime: time
                })
            });
        } catch (error) {
            console.error(error);
        }

        input.value = "";
    }
});


async function getPhoto(username) {
    try {
        const response = await fetch(`/api/getProfilePhoto?username=${username}`);
        return await response.text();
    } catch (error) {
        console.error(error);
    }
}

const socket = new SockJS("websocket");
const stompClient = Stomp.over(socket);

stompClient.connect({}, () => {
    stompClient.subscribe("/topic/reloadChat", async () => {
        await generateConversation();  // Refresh only the chat box
    });
});