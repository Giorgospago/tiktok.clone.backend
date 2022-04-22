const jwt = require('jsonwebtoken');
const {getAuth} = require('firebase-admin/auth');


try {
    const socialLogin = async (req, res) => {
        const fireToken = req.body.token;
        let decoded;
        try {
            decoded = await getAuth().verifyIdToken(fireToken);
        } catch (e) {
            return res.json({
                success: false,
                message: e.message
            });
        }

        let user = await User.findOne({email: decoded.email});
        if (!user) {
            user = new User();
        }
        user.email = decoded.email;
        user.name = decoded.name;
        user.uid = decoded.uid;
        user.photo = decoded.picture;
        user.provider = decoded.firebase.sign_in_provider;
        await user.save();

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

        if (req.body && req.body.token) {
            const user = await User.findById(req.user._id);
            user.deviceTokens = user.deviceTokens.filter(t => t !== req.body.token);
            await user.save();
        }

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
        socialLogin,
        logout,
        register
    };
} catch (e) {
    console.log(e);
}




