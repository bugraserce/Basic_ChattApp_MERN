const UserModelDB = require('../Models/userModel');
const jwt = require('jsonwebtoken');

const verifyUser = async (req, res, next) => {
    let token;

    // Check if the Authorization header is present and starts with "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            // Extract the token from the header
            token = req.headers.authorization.split(" ")[1]; // Bearer eyvfjwtlwjdsna
            
            // Decode the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Find the user by ID and attach it to the request object
            req.user = await UserModelDB.findById(decoded.id).select("-password");
            
            // Proceed to the next middleware or route handler
            next();
        } catch (error) {
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    // If no token is found, return an error
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }
};

module.exports = verifyUser;
