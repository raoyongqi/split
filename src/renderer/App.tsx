import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Login from "./components/Login";
import Switch from "./components/Switch"

const App: React.FC = () => {
  return (
    <Router>
      <div>
        {/* 导航栏 */}
        <Navbar />

        {/* 路由设置 */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/switch" element={<Switch />} />

        </Routes>
      </div>
    </Router>
  );
};

export default App;
