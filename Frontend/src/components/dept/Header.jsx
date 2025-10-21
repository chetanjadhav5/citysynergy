// components/Header.jsx

import { Menu } from "lucide-react"

const Header = ({ isSidebarCollapsed }) => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 shadow-sm">
      {isSidebarCollapsed && (
        <div className="ml-4 text-lg font-semibold text-gray-800">Department Dashboard</div>
      )}
    </header>
  );
};

export default Header

