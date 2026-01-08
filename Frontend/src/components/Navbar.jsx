import React, { useState } from 'react';
import {
  Moon,
  Sun,
  LogOut,
  MessageSquare,
  Menu,
  X,
} from 'lucide-react';

function Navbar({
  isAuthenticated,
  recentSearches,
  onNewChat,
  onLogout,
  onThemeToggle,
  onSearchSelect,
  isDarkMode,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const borderClass = isDarkMode ? 'border-green-700' : 'border-green-300';
  const secondaryBgClass = isDarkMode ? 'bg-green-800' : 'bg-green-100';
  const sidebarBg = isDarkMode ? 'bg-green-900' : 'bg-white';

  return (
    <>
      <div
        className={`md:hidden flex items-center p-4 border-b ${borderClass}`}
      >
        <h1 className="font-bold text-lg">TaxQA NG</h1>

        <button
          onClick={() => setMenuOpen(true)}
          className="ml-auto"
        >
          <Menu size={28} />
        </button>
      </div>

      {/*  OVERLAY  */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300
          ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          md:hidden`}
      />

      {/* MOBILE SLIDE-IN MENU */}
      <div
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300
          ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
          ${sidebarBg}
          md:hidden`}
      >
        <div className={`p-4 border-b ${borderClass} flex items-center`}>
          <h2 className="font-semibold text-lg">Menu</h2>
          <button
            onClick={() => setMenuOpen(false)}
            className="ml-auto"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          <NavContent
            isAuthenticated={isAuthenticated}
            recentSearches={recentSearches}
            onNewChat={onNewChat}
            onLogout={onLogout}
            onThemeToggle={onThemeToggle}
            onSearchSelect={onSearchSelect}
            isDarkMode={isDarkMode}
            secondaryBgClass={secondaryBgClass}
            borderClass={borderClass}
            closeMenu={() => setMenuOpen(false)}
          />
        </div>
      </div>

      {/*  DESKTOP SIDEBAR  */}
      <div
        className={`hidden md:block fixed top-10 left-0 h-screen w-64 pt-20" border-r ${borderClass} ${sidebarBg}`}
      >

        <div className="p-4">
          <NavContent
            isAuthenticated={isAuthenticated}
            recentSearches={recentSearches}
            onNewChat={onNewChat}
            onLogout={onLogout}
            onThemeToggle={onThemeToggle}
            onSearchSelect={onSearchSelect}
            isDarkMode={isDarkMode}
            secondaryBgClass={secondaryBgClass}
            borderClass={borderClass}
          />
        </div>
      </div>
    </>
  );
}

export default Navbar;
function NavContent({
  isAuthenticated,
  recentSearches,
  onNewChat,
  onLogout,
  onThemeToggle,
  onSearchSelect,
  isDarkMode,
  secondaryBgClass,
  borderClass,
  closeMenu,
}) {
  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => {
          onNewChat();
          closeMenu?.();
        }}
        className={`px-4 py-2 rounded-lg ${secondaryBgClass} flex items-center gap-2 cursor-pointer`}
      >
        <MessageSquare size={18} />
        New Chat
      </button>

      {isAuthenticated && (
        <>
          {Array.isArray(recentSearches)&& recentSearches.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2 cursor-pointer">Recent Searches</p>
              <div className="space-y-1">
                {
                recentSearches.map(chat => (
  <div
    key={chat.id}
    onClick={() => onSearchSelect(chat.id)}
    className={`p-2 rounded border ${borderClass} cursor-pointer`}
  >
    {chat.title}
  </div>
))
}
                
              </div>
            </div>
          )}

          <button
            onClick={() => {
              onLogout();
              closeMenu?.();
            }}
            className={`px-4 py-2 rounded-lg ${secondaryBgClass} flex items-center gap-2 cursor-pointer`}
          >
            <LogOut size={18} />
            Logout
          </button>
        </>
      )}

      <button
        onClick={onThemeToggle}
        className={`px-4 py-2 rounded-lg ${secondaryBgClass} flex items-center gap-2 cursor-pointer`}
      >
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        Toggle Theme
      </button>
    </div>
  );
}
