import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Login from "./components/Login";
import Switch from "./components/Switch"
import Search from "./components/Search";
import Read from "./components/Read";
import Video from "./components/Video";
// import Cid from "./components/Cid";
import Play from "./components/Play";
import Ara from "./components/Ara";

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
          <Route path="/video" element={<Video />} />
          {/* <Route path="/cid" element={<Cid />} /> */}
          <Route path="/play" element={<Play />} />
          <Route path="/ara" element={<Ara />} />

        </Routes>
      </div>
    </Router>
  );
};

export default App;
