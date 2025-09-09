import jwt from "jsonwebtoken";

// Middleware Function สำหรับตรวจสอบ JWT Token
const protect = async (req, res, next) => {
  try {
    // ตรวจสอบว่ามี Token ใน Header หรือไม่
    const token = req.headers.authorization;
    
    if (!token || !token.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Token has invalid format"
      });
    }

    const tokenWithoutBearer = token.split(" ")[1];

    // ตรวจสอบ Token ด้วย jwt.verify
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
    const decoded = jwt.verify(tokenWithoutBearer, JWT_SECRET);
    
    // เก็บข้อมูล user ที่ decode แล้วไว้ใน req.user
    req.user = decoded;
    
    // เรียก next() เพื่อไปยัง middleware หรือ controller ถัดไป
    next();
    
  } catch (error) {
    return res.status(401).json({
      message: "Token is invalid"
    });
  }
};

export { protect };
