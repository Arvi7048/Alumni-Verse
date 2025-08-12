import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const PageWrapper = () => {
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';

  const mainContainerClass = isChatPage
    ? 'h-[calc(100vh-64px)] container mx-auto' // Chat page: full height with consistent container
    : 'container mx-auto px-4 py-8'; // Other pages: standard container with padding

  return (
    <>
      <Navbar />
      <main className={mainContainerClass}>
        <Outlet />
      </main>
    </>
  );
};

export default PageWrapper;
