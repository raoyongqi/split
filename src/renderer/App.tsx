import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Login from "./components/Login";
import Switch from "./components/Switch"
import Search from "./components/Search";
import Read from "./components/Read";

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
          <Route path="/search" element={<Search />} />
          <Route path="/read" element={<Read />} />

        </Routes>
      </div>
    </Router>
  );
};

export default App;
