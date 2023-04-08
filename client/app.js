const app = new Vue({
  el: "#app",
  data: {
    error: "",
    message: "",
    username: "",
    userID: "",
    friend: "",
    loading: true,
    requesting: false,
    choosing: false,
    loginModal: true,
    friendModal: false,
    chat: true,
    chatbox: false,
    requests: [],
    chats: [],
    currentChat: "",
    disconnected: true,
    socket: io("https://single-page-chat-app-steel.vercel.app/socket.io"),
    child: "",
    parent: "",
    newChatM: false,
    newFriend: false,
  },
  filters: {
    trim(value) {
      if (!value) {
        return "";
      }
      return value.substring(0, 23);
    },
  },
  methods: {
    chatter(input) {
      if (input === "chat") {
        this.chat = true;
        this.newChatM = false;
      } else {
        this.chat = false;
        this.newFriend = false;
      }
    },
    logger() {
      this.loginModal = false;
      this.choosing = false;
    },
    friending() {
      this.friendModal = false;
      this.requesting = false;
    },
    requestUser(userID, friend) {
      this.requesting = true;
      axios
        .post("https://single-page-chat-app-steel.vercel.app/request", {
          from: userID,
          for: friend,
        })
        .then((res) => {
          this.requesting = false;
          if (res.data.userExist !== undefined) {
            this.error = "User doesnt exist";
          } else if (res.data.weird) {
            this.error = "You can't be friend with yourself [you can actually]";
          } else if (res.data.requestExist) {
            this.error = `Similar request exists`;
          } else {
            this.sendRequest(res.data, res.data.for, res.data.from);
            this.friendModal = false;
            this.error = "";
          }
        });
    },
    createUser(username) {
      if (username.length < 5) {
        this.error = "Username should be more tha 4 characters";
      } else {
        this.choosing = true;
        axios
          .post("https://single-page-chat-app-steel.vercel.app/user", {
            username: username,
          })
          .then((res) => {
            if (res.data.usernameExist) {
              this.choosing = false;
              this.error = "Username taken";
            } else {
              localStorage.setItem("userID", res.data._id);
              this.userID = res.data._id;
              this.registerSocket(this.userID);
              this.loginModal = false;
            }
          });
      }
    },
    acceptRequest(request, index) {
      this.requests.splice(index, 1);
      const payload = {
        between: [request.from._id, request.for],
        id: request._id,
      };
      axios
        .post("https://single-page-chat-app-steel.vercel.app/chat", payload)
        .then((res) => {
          const id1 = res.data.between[0];
          const id2 = res.data.between[1];
          this.newChat(res.data, id1._id, id2._id);
          this.chats.push(res.data);
        });
    },
    declineRequest(id, index) {
      this.requests.splice(index, 1);
      axios
        .delete(`https://single-page-chat-app-steel.vercel.app/request/${id}`)
        .then((res) => {
          console.log(res.data);
        });
    },
    updateChatbox(index) {
      this.chatbox = true;
      this.currentChat = this.chats[index];
      let temp = this.chats[0];
      this.chats[0] = this.chats[index];
      this.chats[index] = temp;
    },
    sendMessage(message) {
      if (message.length > 0) {
        const payload = {
          owner: this.userID,
          content: message,
        };
        this.message = "";
        this.currentChat.messages.push(payload);
        this.chats.splice(0, 1, this.currentChat);
        this.$nextTick(() => {
          const parent = document.querySelector("div.message-container");
          const child = document.querySelector("div.tight");
          const diff = child.clientHeight + 20 - parent.clientHeight;
          parent.scrollTop = diff;
        });
        const party1ID = this.currentChat.between[0]._id;
        const party2ID = this.currentChat.between[1]._id;
        this.socket.emit("messageSent", {
          chat: this.currentChat,
          id1: party1ID,
          id2: party2ID,
        });
        axios
          .post(
            `https://single-page-chat-app-steel.vercel.app/message/${this.currentChat._id}`,
            payload
          )
          .then((res) => {
            this.chats[0] = res.data;
          });
      }
    },
    registerChats(chats) {
      this.socket.emit("registerAll", chats);
    },
    registerSocket(id) {
      this.socket.emit("register", id);
    },
    sendRequest(request, id1, id2) {
      const data = {
        request,
        id1,
        id2,
      };
      this.socket.emit("requestSent", data);
    },
    newChat(chat, id1, id2) {
      const data = {
        chat,
        id1,
        id2,
      };
      this.socket.emit("updateChat", data);
    },
    updateChat(updatedChat) {
      if (updatedChat._id === this.currentChat._id) {
        this.currentChat = updatedChat;
      }
      this.chats = this.chats.map((chat) =>
        chat._id === updatedChat._id ? updatedChat : chat
      );
    },
  },
  mounted() {
    this.socket.on("connect", () => {
      this.disconnected = false;
    });
    this.socket.on("disconnect", () => {
      this.disconnected = true;
    });
    this.socket.on("requestReceived", (request) => {
      this.requests.push(request);
      this.newFriend = true;
    });
    this.socket.on("newChat", (chat) => {
      this.chats.push(chat);
      this.newChatM = true;
    });
    this.socket.on("messageReceived", (chat) => {
      this.updateChat(chat);
      const parent = document.querySelector("div.message-container");
      const child = document.querySelector("div.tight");
      let diff = child.clientHeight - parent.clientHeight - parent.scrollTop;
      console.log("diff", diff);
      if (diff > -32) {
        this.$nextTick(() => {
          parent.scrollTop = child.clientHeight + 20 - parent.clientHeight;
        });
      }
    });
    this.userID = localStorage.getItem("userID");
    if (this.userID) {
      axios
        .get(
          `https://single-page-chat-app-steel.vercel.app/user/${this.userID}`
        )
        .then((res) => {
          if (!res.data) {
            this.loading = false;
            this.loginModal = true;
          } else {
            localStorage.setItem("userID", res.data._id);
            this.userID = res.data._id;
            this.registerSocket(this.userID);
            axios
              .get(
                `https://single-page-chat-app-steel.vercel.app/request/${this.userID}`
              )
              .then((res) => {
                this.requests = res.data;
                axios
                  .get(
                    `https://single-page-chat-app-steel.vercel.app/chat/${this.userID}`
                  )
                  .then((res) => {
                    this.chats = res.data;
                    this.currentChat = res.data[0];
                    this.loading = false;
                    this.loginModal = false;
                  });
              });
            this.loginModal = true;
          }
        });
    } else {
      this.loading = false;
      this.loginModal = true;
    }
  },
});
