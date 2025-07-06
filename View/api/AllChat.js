  
    const senderStr = localStorage.getItem("user");
    const sender = senderStr ? JSON.parse(senderStr) : null;
    const senderId = sender ? sender._id : null;
    const token = localStorage.getItem("token");
    const socket = io("http://localhost:4000");
    
    let receiverId = "";
    
    const urlParams = new URLSearchParams(window.location.search);
    const receiverIdFromUrl = urlParams.get('receiverId');
    const name = urlParams.get('name');
    const image = urlParams.get('image');
    
    const decodedName = name ? decodeURIComponent(name) : "مستخدم جديد";
    const decodedImage = image ? decodeURIComponent(image) : "https://via.placeholder.com/48?text=User";
    
    
    
    const chatBox = document.getElementById("chat-box");
    const input = document.getElementById("message-input");
    const sendBtn = document.getElementById("send-btn");
    const userlist = document.getElementById("user-list");
    const chatHeaderImg = document.getElementById("chat-header-img");
    const chatHeaderName = document.getElementById("chat-header-name");
    
    socket.emit("addUser", senderId);
    
    async function initializeChat() {
      const users = await getUsers();
      if (receiverIdFromUrl) {
        selectUserById(receiverIdFromUrl);
      } else if (users.length > 0) {
        const firstUser = users[0];
        selectUser(firstUser.name, firstUser._id, firstUser.image);
      }
    }
    initializeChat();
    
    function formatTime(dateStr) {
      const date = new Date(dateStr);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    function displayMessage(isMine, text, createdAt, mediaUrl = null, mediaType = null) {
      const msg = document.createElement("div");
      msg.className = `message ${isMine ? "" : "theirs"}`;
    
      let content = "";
    
      if (mediaUrl) {
        if (mediaType.startsWith("image")) {
          content += `<img src="${mediaUrl}" alt="image" style="max-width: 100%; border-radius: 8px; margin-top: 8px;" />`;
        } else if (mediaType.startsWith("video")) {
          content += `<video controls style="max-width: 100%; border-radius: 8px; margin-top: 8px;">
                        <source src="${mediaUrl}" type="${mediaType}" />
                        Your browser does not support the video tag.
                      </video>`;
        }
      }
    
      if (text) {
        content = `<p>${text}</p>` + content;
      }
    
      msg.innerHTML = `
        ${content}
        <div class="timestamp">${formatTime(createdAt)}</div>
        ${isMine ? '<div class="you-label">You</div>' : ''}
      `;
    
      chatBox.appendChild(msg);
      chatBox.scrollTop = chatBox.scrollHeight;
    }
    
    function scrollToBottom() {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
    
    async function loadMessages() {
      chatBox.innerHTML = "";
      if (!receiverId) return;
    
      const res = await fetch(`http://localhost:4000/api/V1/chat/getMessage/${senderId}/${receiverId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      });
    
      if (!res.ok) {
        console.error("Failed to load messages");
        return;
      }
    
      const messages = await res.json();
      messages.forEach(msg => {
        const isMine = msg.senderId.toString() === senderId;
        displayMessage(isMine, msg.message, msg.createdAt, msg.mediaUrl, msg.mediaType);
      });
      scrollToBottom();
    }
    
    function selectUser(name, id, image) {
      receiverId = id;
      chatHeaderName.textContent = name;
      chatHeaderImg.src = image || "https://via.placeholder.com/48?text=Dr";
      localStorage.setItem("selectedUser", JSON.stringify({ _id: id, name, image }));
      loadMessages();
    }
    
    async function selectUserById(id) {
      try {
        let users = [];
        const storedUsersStr = localStorage.getItem("usersList");
        if (storedUsersStr) {
          users = JSON.parse(storedUsersStr);
        }
    
        if (!users.length) {
          const res = await fetch(`http://localhost:4000/api/V1/chat/getallchat`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            users = data.senders || data;
            localStorage.setItem("usersList", JSON.stringify(users));
          }
        }
    
        const user = users.find(u => u._id === id);
    
        if (user) {
      selectUser(user.name, user._id, user.image);
    } else {
      receiverId = id;
      chatHeaderName.textContent = decodedName;
      chatHeaderImg.src = decodedImage;
      chatBox.innerHTML = "";
    }
    
      } catch (err) {
        console.error("Failed to select user by id:", err);
      }
    }
    
    sendBtn.addEventListener("click", async () => {
      const text = input.value.trim();
      const fileInput = document.getElementById("media-input");
      const file = fileInput.files[0];
    
      if (!text && !file) return;
    
      const formData = new FormData();
      formData.append("receiverId", receiverId);
      if (text) formData.append("message", text);
      if (file) formData.append("media", file);
    
      try {
        const res = await fetch("http://localhost:4000/api/V1/chat/sendMessage", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
    
        const data = await res.json();
        if (res.ok) {
          const { newMessage } = data;
          displayMessage(true, newMessage.message, newMessage.createdAt, newMessage.mediaUrl, newMessage.mediaType);
          input.value = "";
          fileInput.value = null;
    
          // تحديث قائمة المستخدمين إذا المستخدم جديد
          const currentUsers = JSON.parse(localStorage.getItem("usersList") || "[]");
          const isInList = currentUsers.some(u => u._id === receiverId);
          if (!isInList) {
            const newUser = {
              _id: receiverId,
              name: chatHeaderName.textContent,
              image: chatHeaderImg.src,
              hasUnread: false
            };
            currentUsers.push(newUser);
            localStorage.setItem("usersList", JSON.stringify(currentUsers));
            renderUsers(currentUsers);
          }
        }
      } catch (err) {
        console.error(err);
        alert("Error sending message");
      }
    });
    
    socket.on("privateMessage", ({ senderId: incomingSender, receiverId: incomingReceiver, message, mediaUrl, mediaType, createdAt }) => {
      if ((incomingSender === receiverId && incomingReceiver === senderId) || (incomingSender === senderId && incomingReceiver === receiverId)) {
        const isMine = incomingSender === senderId;
        displayMessage(isMine, message, createdAt, mediaUrl, mediaType);
        scrollToBottom();
      }
    });
    
    function renderUsers(users) {
      userlist.innerHTML = "";
      users.forEach((doc) => {
        const div = document.createElement("div");
        div.className = "user";
        if (doc.hasUnread) {
          div.classList.add("unread");
        }
        const img = document.createElement("img");
        img.src = doc.image || "https://via.placeholder.com/48?text=Dr";
        img.alt = doc.name;
        div.appendChild(img);
    
        const nameSpan = document.createElement("span");
        nameSpan.className = "name";
        nameSpan.textContent = doc.name;
    
        div.onclick = async () => {
      document.querySelectorAll(".user").forEach(userDiv => userDiv.classList.remove("selected"));
      div.classList.add("selected");
    
      selectUser(doc.name, doc._id, doc.image);
      receiverId = doc._id;
      chatHeaderName.textContent = doc.name;
      chatHeaderImg.src = doc.image || "https://via.placeholder.com/48?text=Dr";
      div.classList.remove("unread");
    
      try {
        await fetch(`http://localhost:4000/api/v1/chat/markMessageAsRead`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error("Failed to mark messages as read:", err);
      }
    };
    
    
        div.appendChild(nameSpan);
        userlist.appendChild(div);
      });
    }
    
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendBtn.click();
      }
    });
    
    async function getUsers() {
      try {
        const storedUsers = localStorage.getItem("usersList");
        let users;
        if (storedUsers) {
          users = JSON.parse(storedUsers);
        } else {
          const res = await fetch(`http://localhost:4000/api/V1/chat/getallchat`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
    
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
    
          const data = await res.json();
          users = data.senders || data;
          localStorage.setItem("usersList", JSON.stringify(users));
        }
    
        renderUsers(users);
        return users;
    
      } catch (error) {
        console.error("Failed to load your contact:", error);
        return [];
      }
    }
    
    window.addEventListener("beforeunload", function () {
      localStorage.removeItem("selectedUser");
      localStorage.removeItem("usersList");
    });
    
    function goToProfile() {
      if (receiverId) {
        window.location.href = `viewotherprofile.html?id=${receiverId}`;
      }
    }
    
    