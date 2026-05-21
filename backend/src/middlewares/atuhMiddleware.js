import jwt, { decode } from "jsonwebtoken";

/**
 * Middleware to verify JWT token.
 * 
 * Checks the authorization header, verifies the token, 
 * and saves user data in req.user.
 *
 * @constant verifyToken
 * @requires jsonwebtoken
 * @env process.env.JWT_Secret
 *
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 * @param {Function} next - Express next function.
 */


export const verifyToken = (req, res, next) => {
  const authHeeader = req.headers["authorization"];
  const token= authHeeader && authHeeader.split(" ")[1] ? authHeeader.split(" ")[1] : authHeeader;

  if (!token) {
    return res.status(403).json({ message: " no token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
    if (err) {
      return res.status(401).json({ message: "unauthorized access" });
    }

    req.user = decode;
    next();
  });
};

/**
 * Middleware to check user roles.
 * 
 * Checks if the user's role has permission to access the route.
 *
 * @constant verifyRole
 *
 * @param {string} roles - The required role.
 * @returns {Function} Express middleware function.
 */

export const verifyRole = (roles) => {
  return (req, res, next) => {
  
    if(req.user.role !== roles){
        return res.status(403).json({ message: "you don't have permission" });
    }
    next();
  };
};
