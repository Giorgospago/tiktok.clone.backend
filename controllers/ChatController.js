
const getChats = async (req, res) => {
    let chats = await Chat
        .find({
            users: {$elemMatch: {$eq: req.user._id}}
        })
        .populate([
            {
                path: "users",
                select: "name photo"
            }
        ])
        .exec();

    chats = chats.map(c => {
        const names = c.users
            .filter(u => u._id.toString() !== req.user._id.toString())
            .map(u => u.name)
            .join(", ");

        c.name = c.name || names;

        return c;
    });

    res.json({
        success: true,
        data: chats,
        message: "Chats fetched"
    });
};

const getUsersForChatting = async (req, res) => {
    const user = await User.findById(req.user._id).exec();
    const userIds = _.intersection(
        user.followers.map(u => u.toString()),
        user.following.map(u => u.toString())
    );

    const users = await User
        .find({
            _id: {$in: userIds}
        })
        .select("name photo gender")
        .exec();

    res.json({
        success: true,
        data: users,
        message: "Users fetched"
    });
};

const create = async (req, res) => {
    const myId = req.user._id.toString();
    if (!req.body.users.includes(myId)) {
        req.body.users.push(myId);
    }

    const chat = new Chat(req.body);
    await chat.save();

    res.json({
        success: true,
        data: chat,
        message: "Chat created successfully"
    });
};

const getChat = async (req, res) => {
    let c = await Chat
        .findById(req.params.chatId)
        .populate([
            {
                path: "users",
                select: "name photo"
            }
        ])
        .exec();

    const names = c.users
        .filter(u => u._id.toString() !== req.user._id.toString())
        .map(u => u.name)
        .join(", ");

    c.name = c.name || names;


    res.json({
        success: true,
        data: c,
        message: "Chat fetched"
    });
};

const getChatMessages = async (req, res) => {
    const chat = await Chat.findById(req.params.chatId);
    const myId = req.user._id.toString();
    const chatUsers = chat.users.map(u => u.toString());

    if (!chatUsers.includes(myId)) {
       return res.json({
           success: false,
           message: "You have not access to this chat"
       });
    }

    const messages = await ChatMessage.find({chat: chat._id});

    res.json({
        success: true,
        data: messages,
        message: "Chat messages fetched"
    });
};


/**
 * Socket Methods
 */
const onSendMessage = async (socket, data) => {
    const newMessage = {
        message: data.text,
        sender: data.sender,
        chat: data.chat
    };
    const chatMessage = new ChatMessage(newMessage);
    await chatMessage.save();

    io.emit(`chat:receive-message:${data.chat}`, chatMessage);
};



module.exports = {
    getChat,
    getChatMessages,
    create,
    getChats,
    getUsersForChatting,

    // socket methods
    onSendMessage
};
