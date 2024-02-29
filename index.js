const { Server } = require("socket.io");

const io = new Server({ cors: "http://localhost:5173" });

let onlineUsers = [];

io.on("connection", (socket) => {
    console.log("New connection: ", socket.id);

    // server socket lắng nghe sự kiện phát ra từ phía client với sự kiện có tên là addNewUser
    socket.on("addNewUser", (userId) => {
        // check trong onlineUser khi có người connect vào thì id của họ có trong onlineUser chưa
        // nếu chưa thì push vào, nếu rồi thì ko push nữa
        !onlineUsers.some((user) => user.userId === userId) &&
            onlineUsers.push({
                userId,
                socketId: socket.id,
            });

        console.log("onlineUsers: ", onlineUsers);

        io.emit("getOnlineUsers", onlineUsers);
    });

    // res mess and add message
    socket.on("sendMessage", (message) => {
        // tìm user đang online
        const user = onlineUsers.find(
            (user) => user.userId === message.recipientId
        );

        if (user) {
            // gửi tin nhắn và thông báo cho người nhận
            io.to(user.socketId).emit("getMessage", message);
            io.to(user.socketId).emit("getNotification", {
                senderId: message.senderId,
                isRead: false,
                date: new Date(),
            });
        }
    });

    socket.on("disconnect", () => {
        onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);

        io.emit("getOnlineUsers", onlineUsers);
    });
});

// cổng 3000 trên server socket
io.listen(3000);
