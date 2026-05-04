import React from 'react';
import Header from '../components/Header';
import AdBanner from '../components/AdBanner';
import bgImage from '../assets/rename.jpg';

interface MainLayoutProps {
  children: React.ReactNode;
  filterProps?: any;
  topAdActive?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, filterProps, topAdActive = false }) => {
  return (
    <div 
      className="min-h-screen text-slate-100 flex flex-col w-full overflow-x-hidden bg-cover bg-center bg-no-repeat bg-fixed relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-[#0b0f19]/85 pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header filterProps={filterProps} />
        <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 flex-grow select-none">
          <AdBanner position="top" active={topAdActive} />
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;