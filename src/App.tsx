
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PlayerPage from './pages/PlayerPage';
import StreamViewPage from './pages/StreamViewPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/watch/:matchId" element={<PlayerPage />} />
        <Route path="/stream/:matchId/:sourceId/:streamId" element={<StreamViewPage />} />
        <Route path="*" element={
          <div className="p-12 text-center text-white font-semibold flex flex-col gap-2">
            <h2 className="text-3xl text-red-500 font-black">404</h2>
            <p className="text-slate-400 text-sm">Page Not Found</p>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
