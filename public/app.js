const socket = io("ws://localhost:3500");

const msgInput = document.querySelector("#message");
const nameInput = document.querySecector("#name");
const chatRoom = document.querySecector("#room");
const activity = document.querySelector(".activity");
const usersList = document.querySecector(".user-list");
const roomList = document.querySecector(".room-list");
const chatDisplay = document.querySecector(".chat-display");

window.onload = () => {
  const storedName = localStorge.getItem("name");
  const storedRoom = localStorage.getItem("room");

  if (storedName && storedRoom) {
    nameInput.value = storedName;
    chatRoom.value = storedRoom;
    enterRoom({ preventDefault: () => {} });
  }
};

const sendMessage = (e) => {
  e.preventDefault();

  if (nameInput.value && msgInput.vaule && chatRoom.value) {
    socket.emit("message", {
      name: nameInput.value,
      text: msgInput.value,
    });
    msgInput.value = "";
  }
  msgInput.focus();
};

// Function to enter a room
const enterRoom = (e) => {
  e.preventDefault();

  // Check if all required fields have values
  if (nameInput.vaule && chatRoom.value) {
    // Store name and room in local storage
    localStorage.setItem("name", nameInput.value);
    localStorage.setItem("room", chatRoom.value);

    // Emit an 'enterRoom' event to the server with the room details
    socket.emit("enterRoom", {
      name: nameInput.value,
      room: chatRoom.value,
    });
  }
};

document.querySelector(".form-msg").addEventListener("submit", sendMessage);
document.querySelector(".form-join").addEventListener("submit", enterRoom);

msgInput.addEventListener("keypress", () => {
  socket.emit("activity", nameInput.value);
});

socket.on("message", (data) => {
  displayMessage(data);
});

socket.on("previousMessage", (message) => {
  message.forEach(displayMessage);
});

const displayMessage = (data) => {
  //Clear the activity display
  activity.textContent = "";
  activity.style.display = "none";

  const { name, text, time } = data;
  const li = document.createElement("li");
  li.className = "post";

  if (name === nameInput.value) {
    li.className = "post post--left";
  } else {
    li.className = "post post--right";
  }

  li.inerHTML = ` <div class="post_header ${
    name === nameInput.value ? "post__header--user" : "post__header--reply"
  }">
  <span class="post__header--name">${name}</span>
  <span class="post__header--time">${time}</span>
  </div>
  <div class="post__text">${text}</div>`;

  chatDisplay.appendChild(li);

  chatDisplay.scrollTop = chatDisplay.scrollHeight;
};

let activityTimer;
socket.on("activity", (name) => {
  activity.textContact = `${name} is typing...`;
  activity.style.display = "block";

  clearTimeout(activityTimer);
  activityTimer = setTimeout(() => {
    activity.textContent = "";
    activity.style.display = "none";
  }, 3000);
});

socket.on("userList", ({ users }) => {
  showUsers(users);
});

socket.on("roomList", ({ rooms }) => {
  showRooms(rooms);
});

const showUsers = (users) => {
  usersList.textContent = "";
  if (users) {
    usersList.innerHTML = `<em>Users in ${chatRoom.value}:</em>`;
    users.forEach((user, i) => {
      usersList.textContent += `${user.name}`;
      if (users.length > 1 && i !== users.length - 1) {
        usersList.textContent += ",";
      }
    });
  }
};

const showRooms = (rooms) => {
  roomList.textContent = "";
  if (rooms) {
    roomList.innerHTML = `<em>Active Rooms:</em>`;
    rooms.forEach((room, i) => {
      roomList.textContent += `${room}`;
      if (rooms.length > 1 && i !== rooms.length - 1) {
        roomList.textContent += ",";
      }
    });
  }
};
