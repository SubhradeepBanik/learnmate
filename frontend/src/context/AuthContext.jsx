import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const DEFAULT_DEMO_USERS = {
  student: {
    id: "stu-1",
    name: "Student Name",
    email: "student@example.com",
    role: "student",
    department: "Computer Science Engineering",
    college: "Dibrugarh University",
    semester: "3rd Semester",
  },
  teacher: {
    id: "tea-1",
    name: "Dr. Debajit Sharma",
    email: "teacher@dibru.ac.in",
    role: "teacher",
    department: "Computer Science Engineering",
    college: "Dibrugarh University",
    designation: "Associate Professor",
  },
};

export function AuthProvider({ children }) {
  // Start as null — user must always sign in; localStorage restores a previous session
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("learnmate_auth_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem("learnmate_auth_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("learnmate_auth_user");
      }
    } catch {
      /* ignore */
    }
  }, [user]);

  const login = (email, password, role = "student", extraData = {}) => {
    const isTeacher = role === "teacher" || email.includes("teacher") || email.includes("prof");
    const matchedRole = isTeacher ? "teacher" : "student";
    const demoBase = DEFAULT_DEMO_USERS[matchedRole];

    const newUser = {
      ...demoBase,
      email: email || demoBase.email,
      name: extraData.name || (isTeacher ? "Dr. Debajit Sharma" : "Student Name"),
      role: matchedRole,
      ...extraData,
    };

    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("learnmate_auth_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || "student",
        isAuthenticated: !!user,
        login,
        logout,
        setUser,
        DEFAULT_DEMO_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
