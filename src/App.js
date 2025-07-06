import React, { useEffect, useState } from "react";
import { auth } from "./firebase/config";
import { onAuthStateChanged, getRedirectResult } from "firebase/auth";
import Home from "./pages/Home";
import Login from "./pages/Login";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Xử lý redirect result từ Google sign-in
    getRedirectResult(auth).then((result) => {
      if (result) {
        console.log("Redirect sign-in successful:", result.user);
      }
    }).catch((error) => {
      console.error("Redirect sign-in error:", error);
    });

    // Lắng nghe thay đổi trạng thái authentication
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Kiểm tra nếu user tồn tại nhưng email chưa xác thực
      if (user && !user.emailVerified) {
        // Đăng xuất user nếu email chưa xác thực
        auth.signOut().then(() => {
          setUser(null);
          setLoading(false);
        }).catch((error) => {
          console.error("Lỗi khi đăng xuất:", error);
          setUser(null);
          setLoading(false);
        });
      } else {
        setUser(user);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? <Home /> : <Login />;
}

export default App;
