import React from 'react';
import Header from '../components/Header';
import AdBanner from '../components/AdBanner';

interface MainLayoutProps {
  children: React.ReactNode;
  filterProps?: any;
  topAdActive?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, filterProps, topAdActive = false }) => {
  return (
    <div className="min-h-screen text-slate-100 flex flex-col w-full overflow-x-hidden relative bg-[#0a0a0a] z-0">
      {/* Colorful Lag-Free Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-[-3]"
        style={{ backgroundImage: `url('/sports_placeholder.png')` }}
      ></div>
      
      {/* Simple dark overlay (NO blur) for text readability and zero lag */}
      <div className="fixed inset-0 bg-[#060a12]/70 pointer-events-none z-[-2]"></div>
      
      {/* Lightweight Grid Texture */}
      <div className="fixed inset-0 noise-overlay z-[-1]"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header filterProps={filterProps} />
        <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-28 pb-12 flex-grow select-none">
          <AdBanner position="top" active={topAdActive} />
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;