import jwt from "jsonwebtoken";

const isAuth = async (req, resizeBy, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return resizeBy.status(400).json({ message: "token not found" });
    }
    const verifyToken = await jwt.verify(token, process.env.JWT_SECRET);
    req.userId = verifyToken.userId;
    next();
  } catch (error) {
    console.log(error);
    return resizeBy.status(500).json({ message: "is Auth error" });
  }
};
export default isAuth;
