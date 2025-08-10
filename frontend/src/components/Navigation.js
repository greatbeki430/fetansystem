import { Link } from "react-router-dom";
import { FiHome, FiList, FiBarChart2 } from "react-icons/fi";

export default function Navigation() {
  return (
    <nav className="main-navigation">
      <Link to="/tasks" className="nav-link">
        <FiList /> Tasks
      </Link>
      <Link to="/dashboard" className="nav-link">
        <FiBarChart2 /> Dashboard
      </Link>
    </nav>
  );
}
