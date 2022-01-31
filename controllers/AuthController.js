const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    let {email, password} = req.body;
    const user = await User
        .findOne({email})
        .exec();

    if (!user) {
        return res.json({
            success: false,
            message: "User does not exists"
        });
    }

    if (!bcryptCompare(password, user.password)) {
        return res.json({
            success: false,
            message: "Wrong password"
        });
    }

    const jwtData = {
        user: {
            _id: user._id,
            email: user.email,
            photo: user.photo,
            name: user.name,
            uid: user.uid,
            username: user.username
        }
    };
    const token = jwt.sign(jwtData, process.env.JWT_SECRET);

    res.json({
        success: true,
        message: `Welcome ${user.name}`,
        data: {
            accessToken: token,
            user: user
        }
    });
};

const logout = async (req, res) => {

    res.json({
        success: true,
        message: `Logged out successfully`
    });
};

const register = async (req, res) => {
    const userExists = await User
        .count({email: req.body.email})
        .exec();

    if (userExists) {
        return res.json({
            success: false,
            message: "User already exists"
        });
    }

    const userData = {
        name: req.body.name,
        email: req.body.email,
        password: bcryptHash(req.body.password)
    };
    const user = new User(userData);
    await user.save();

    res.json({
        success: true,
        message: "User registered successfully",
        data: user
    });
};



module.exports = {
    login,
    logout,
    register
};
