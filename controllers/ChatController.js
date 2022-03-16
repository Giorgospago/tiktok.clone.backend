const admin = require('firebase-admin');

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

    const chatIds = chats.map(c => c._id);
    const lastMessages = await ChatMessage.aggregate([
        {
            $match: {
                chat: {$in: chatIds}
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $group: {
                _id: "$chat",
                doc: {$first: "$$CURRENT"}
            }
        },
        {
            $project: {
                _id: 0,
                chat: "$doc.chat",
                message: "$doc.message",
                createdAt: "$doc.createdAt"
            }
        }
    ]);

    chats = chats.map(c => {
        c = c.toObject();
        const names = c.users
            .filter(u => u._id.toString() !== req.user._id.toString())
            .map(u => u.name)
            .join(", ");

        c.name = c.name || names;
        c.lastMessage = lastMessages.find(lm => lm.chat.toString() === c._id.toString());

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

    const messages = await ChatMessage
        .find({chat: chat._id})
        .limit(20)
        .sort({
            createdAt: -1
        });

    res.json({
        success: true,
        data: messages.reverse(),
        message: "Chat messages fetched"
    });
};

const getChatFromUser = async (req, res) => {
    const loggedIn = await User.findById(req.user._id);
    const userProfile = await User.findById(req.params.id);

    const chat = await Chat.findOne({
        $and: [
            {
                users: {$elemMatch: {$eq: loggedIn._id}}
            },
            {
                users: {$elemMatch: {$eq: userProfile._id}}
            },
            {
                "users.2": {$exists: false}
            }
        ]
    });

    if (!chat) {
        return res.json({
            success: false,
            message: "chat not found"
        });
    }

    res.json({
        success: true,
        message: "chat fetched",
        data: chat
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

    const chat = await Chat
        .findById(data.chat)
        .populate([
            {
                path: "users",
                select: "deviceTokens name photo"
            }
        ]);

    const sender = chat.users.find(u => u.id === data.sender);
    const receivers = chat.users.filter(u => u.id !== data.sender);

    for (let u of receivers) {
        for (let t of u.deviceTokens) {
            if (t.trim()) {
                admin.messaging().send({
                    notification: {
                        title: sender.name,
                        body: data.text,
                        imageUrl: sender.photo
                    },
                    token: t
                });
            }
        }
    }

    io.emit(`chat:receive-message:${data.chat}`, chatMessage);
};



module.exports = {
    getChat,
    getChatMessages,
    create,
    getChats,
    getUsersForChatting,
    getChatFromUser,

    // socket methods
    onSendMessage
};
