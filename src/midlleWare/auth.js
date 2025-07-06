
import jwt from 'jsonwebtoken';
import { userModel } from '../../DB/models/user.model.js';

export const auth = (accessRoles = []) => {
    return async (req, res, next) => {
        try {
            
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer")) {
                return res.status(400).json({ message: "Invalid token format" });
            }
            const token = authHeader.split("Bearer ")[1];
            const decoded = jwt.verify(token, process.env.TokenSignIn);
            const user = await userModel.findById(decoded.id);
            if (!user) {
                return res.status(400).json({ message: "Invalid user" });
            }

          
            if (accessRoles.length && !accessRoles.includes(user.role)) {
                return res.status(403).json({ message: "User not authorized" });
            }

            
            req.user = user;
            next();

        } catch (error) {
            return res.status(400).json({ message: `Error in authentication: ${error.message}` });
        }
    };
};
