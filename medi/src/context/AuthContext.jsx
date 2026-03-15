import { createContext, useContext, useState, useEffect } from "react";
import api, { getCSRFToken } from "../Auth/LoginLogic";

const authContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // const checkAuthentication = async () => {
  //   try {
  //     const res = await api.get("/me/");
  //     setUser(res.data);
  //     console.log(user.data, "user data");
  //   } catch (err) {
  //     console.log(err);
  //     setUser(null);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   checkAuthentication();
  // }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await getCSRFToken();
        const res = await api.get("/me/");

        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch (error) {
        setUser(null);
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    await getCSRFToken();

    try {
      const res = await api.post("/login/", credentials);
      const saveUserSession = {
        username: res.data.username,
        user_type: res.data.user_type,
      };

      setUser(saveUserSession);

      sessionStorage.setItem("user", JSON.stringify(saveUserSession));

      return res;
    } catch (err) {
      console.log(err);
    }
  };

  const logout = async () => {
    try {
      await getCSRFToken();
      await api.post("/logout/");
    } catch (err) {
      console.log(err, "logout err");
    } finally {
      setUser(null);
      sessionStorage.removeItem("user");
    }
  };

  const isAuthenticated = !!user;

  return (
    <authContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        isAuthenticated,
        // loading,
      }}
    >
      {children}
    </authContext.Provider>
  );
}

export function useAuth() {
  return useContext(authContext);
}

export default AuthProvider;
// const [loading, setLoading] = useState(true);
