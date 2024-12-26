import React from "react";
import { Link } from "react-router-dom"; // 使用 Link 组件进行路由导航

const Navbar: React.FC = () => {
  return (
    <nav>
      <ul style={{ display: "flex", listStyleType: "none" }}>
        <li style={{ margin: "0 10px" }}>
          <Link to="/">Home</Link>
        </li>
        <li style={{ margin: "0 10px" }}>
          <Link to="/login">Login</Link>
        </li>

        <li style={{ margin: "0 10px" }}>
          <Link to="/switch">Switch</Link>
        </li>
        
        <li style={{ margin: "0 10px" }}>
          <Link to="/search">Search</Link>
        </li>

        <li style={{ margin: "0 10px" }}>
          <Link to="/read">Read</Link>
        </li>

        <li style={{ margin: "0 10px" }}>
          <Link to="/video">Video</Link>
        </li>
        
        <li style={{ margin: "0 10px" }}>
          <Link to="/cid">Cid</Link>
        </li>

        
        <li style={{ margin: "0 10px" }}>
          <Link to="/play">Play</Link>
        </li>

        
      </ul>
    </nav>
  );
};

export default Navbar;
