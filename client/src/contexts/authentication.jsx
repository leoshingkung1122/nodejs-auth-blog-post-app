import { useState, useContext, createContext } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const AuthContext = createContext();


function AuthProvider(props) {
  const [state, setState] = useState({
    loading: null,
    error: null,
    user: null,
  });
  const navigate = useNavigate();

  const login = async (data) => {
    // 🐨 Todo: Exercise #4
    //  ให้เขียน Logic ของ Function `login` ตรงนี้
    //  Function `login` ทำหน้าที่สร้าง Request ไปที่ API POST /login
    //  ที่สร้างไว้ด้านบนพร้อมกับ Body ที่กำหนดไว้ในตารางที่ออกแบบไว้
    try {
      const result = await axios.post("http://localhost:4000/auth/login", data);
      const token = result.data.token;
      localStorage.setItem("token", token);
      const userDataFromToken = jwtDecode(token);
      setState({
        ...state,
        user: userDataFromToken,
      });
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  }
  

  const register = () => {
    // 🐨 Todo: Exercise #2
    //  ให้เขียน Logic ของ Function `register` ตรงนี้
    //  Function register ทำหน้าที่สร้าง Request ไปที่ API POST /register
    //  ที่สร้างไว้ด้านบนพร้อมกับ Body ที่กำหนดไว้ในตารางที่ออกแบบไว้
  };

  const logout = () => {
    // ลบ JWT Token ออกจาก Local Storage
    localStorage.removeItem("token");
    
    // Update state ให้ user เป็น null
    setState(prev => ({
      ...prev,
      user: null
    }));
    
    // Navigate ไปที่หน้า Login
    navigate("/login");
  };

  const isAuthenticated = Boolean(localStorage.getItem("token"));

  return (
    <AuthContext.Provider
      value={{ state, login, logout, register, isAuthenticated }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

// this is a hook that consume AuthContext
const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
