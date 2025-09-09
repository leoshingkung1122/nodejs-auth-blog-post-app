import axios from "axios";

function jwtInterceptor() {
  axios.interceptors.request.use((req) => {
    // แนบ Token เข้าไปใน Header ของ Request

    const hasToken = Boolean(window.localStorage.getItem("token"));
    
    if (hasToken) {
      req.headers = {
        ...req.headers,
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      };
    }

    return req;
  });

  axios.interceptors.response.use(
    (req) => {
      return req;
    },
    (error) => {
      // รองรับเมื่อ Server Response Error (401 Unauthorized)
      if (error.response.status === 401 &&
        error.response.statusText === "Unauthorized"
      ) {
        // ลบ Token ออกจาก Local Storage
        window.localStorage.removeItem("token");
        
        // Redirect ไปที่หน้า Login
        window.location.replace = "/login";
      }

      return Promise.reject(error);
    }
  );
}

export default jwtInterceptor;
