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
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-brand-accent/30">
      <Header filterProps={filterProps} />
      <main className="container mx-auto p-4 flex-grow max-w-7xl">
        <AdBanner position="top" active={topAdActive} />
        {children}
      </main>
    </div>
  );
};

export default MainLayout;