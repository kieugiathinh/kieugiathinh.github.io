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
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? <Home /> : <Login />;
}

export default App;
