import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../utils/db.js";

const authRouter = Router();

// 🐨 Todo: Exercise #1
// ให้สร้าง API เพื่อเอาไว้ Register ตัว User แล้วเก็บข้อมูลไว้ใน Database ตามตารางที่ออกแบบไว้

// POST /register - สร้างผู้ใช้งานในระบบ
authRouter.post("/register", async (req, res) => {
  try {
    const { username, password, firstName, lastName } = req.body;

    // ตรวจสอบว่ามีข้อมูลครบถ้วนหรือไม่
    if (!username || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อมูลให้ครบถ้วน (username, password, firstName, lastName)"
      });
    }

    // ตรวจสอบว่ามี username ซ้ำหรือไม่
    const existingUser = await db.collection("users").findOne({ username });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "ชื่อผู้ใช้งานนี้มีอยู่แล้วในระบบ"
      });
    }

    // เข้ารหัสรหัสผ่านด้วย bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // สร้างข้อมูลผู้ใช้ใหม่
    const newUser = {
      username,
      password: hashedPassword,
      firstName,
      lastName,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // บันทึกข้อมูลผู้ใช้ลงในฐานข้อมูล
    const result = await db.collection("users").insertOne(newUser);

    // ส่งผลลัพธ์กลับ (ไม่ส่งรหัสผ่าน)
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      success: true,
      message: "User has been created successfully" ,
      data: {
        id: result.insertedId,
        ...userWithoutPassword
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน"
    });
  }
});

// 🐨 Todo: Exercise #3
// ให้สร้าง API เพื่อเอาไว้ Login ตัว User ตามตารางที่ออกแบบไว้

// POST /login - Login ผู้ใช้งานเข้าสู่ระบบ
authRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // ตรวจสอบว่ามีข้อมูลครบถ้วนหรือไม่
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอก username และ password"
      });
    }

    // ตรวจสอบว่ามี username ในฐานข้อมูลหรือไม่
    const user = await db.collection("users").findOne({ username });
    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    // ตรวจสอบรหัสผ่านด้วย bcrypt.compare
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    // สร้าง JWT token โดยใช้ jwt.sign
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // ควรใช้ environment variable
    const token = jwt.sign(
      { 
        id: user._id, 
        firstName: user.firstName, 
        lastName: user.lastName 
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // ส่งผลลัพธ์กลับ
    res.status(200).json({
      message: "login successfully",
      token: token
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ"
    });
  }
});

export default authRouter;
