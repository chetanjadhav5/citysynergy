import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import PropTypes from "prop-types";

const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      
      // On small screens, keep sidebar collapsed by default
      if (isMobileView) {
        setIsSidebarCollapsed(true);
        setIsSidebarOpen(false);
      } else {
        setIsSidebarCollapsed(false);
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initialize on mount
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  return (
    <div className="flex h-screen bg-sky-50 overflow-hidden">
      <Sidebar 
        isMobile={isMobile} 
        isCollapsed={isSidebarCollapsed} 
        isOpen={isSidebarOpen}
        onToggleCollapse={toggleSidebar} 
      />
      
      <div 
        className={`flex flex-col flex-1 overflow-hidden ${
          isMobile 
            ? 'w-full' 
            : (isSidebarCollapsed ? 'w-[calc(100%-5rem)]' : 'w-[calc(100%-16rem)]')
        }`}
      >
        <div className="bg-white shadow-sm px-4 py-2 flex items-center md:hidden">
          <button 
            onClick={toggleSidebar} 
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent ml-2">
            AdminPanel
          </h1>
        </div>
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-2 mb:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

Layout.propTypes = {
  isMobile: PropTypes.bool,
  isSidebarCollapsed: PropTypes.bool,
  isSidebarOpen: PropTypes.bool,
  toggleSidebar: PropTypes.func,
};

export default Layout;