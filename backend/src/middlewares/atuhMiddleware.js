import jwt, { decode } from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeeader = req.headers["authorization"];
  const token= authHeeader && authHeeader.split(" ")[1] ? authHeeader.split(" ")[1] : authHeeader;

  if (!token) {
    return res.status(403).json({ message: " no token provided" });
  }

  jwt.verify(token, process.env.JWT_Secret, (err, decode) => {
    if (err) {
      return res.status(401).json({ message: "unauthorized access" });
    }

    req.user = decode;
    next();
  });
};

export const verifyRole = (roles) => {
  return (req, res, next) => {
    if(req.user.role !== roles){
        return res.status(403).json({ message: "you don't have permission" });
    }
    next();
  };
};
