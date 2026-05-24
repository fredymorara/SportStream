import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMatchesByStatus } from '../store/matchesSlice';
import { api } from '../services/api';
import type { Stream } from '../services/api';

const PLACEHOLDER_IMAGE_URL = '/sports_placeholder.png';

const StreamViewPage: React.FC = () => {
  const { matchId, sourceId, streamId } = useParams<{ matchId: string; sourceId: string; streamId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { rawMatches } = useAppSelector((state) => state.matches);
  const [stream, setStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (rawMatches.length === 0) {
      dispatch(fetchMatchesByStatus('all'));
    }
  }, [dispatch, rawMatches.length]);

  useEffect(() => {
    const fetchStreamDetail = async () => {
      try {
        setLoading(true);
        const match = rawMatches.find((m) => m.id === matchId);
        if (!match) return;

        const source = match.sources.find((s) => s.source === sourceId);
        if (!source) {
          setError("Stream source not found.");
          return;
        }

        const streams = await api.getStreams(source.source, source.id);
        const activeStream = streams.find((s) => s.streamNo.toString() === streamId);

        if (!activeStream) {
          setError("Selected stream not found.");
          return;
        }
        setStream(activeStream);
      } catch (err: any) {
        setError(err.message || "Failed to load stream.");
      } finally {
        setLoading(false);
      }
    };

    if (matchId && sourceId && streamId && rawMatches.length > 0) {
      fetchStreamDetail();
    }
  }, [matchId, sourceId, streamId, rawMatches]);

  const match = rawMatches.find((m) => m.id === matchId) || null;

  if (loading || !match) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <LoadingSpinner color="#10B981" size="80" />
        </div>
      </MainLayout>
    );
  }

  if (error || !stream) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto text-center py-12 glass-panel rounded-2xl p-8 mt-12">
          <p className="text-red-500 text-lg font-medium mb-6">{error || "Data is incomplete."}</p>
          <button
            onClick={() => navigate(`/watch/${matchId}`)}
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black tracking-wide py-3 px-6 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300 hover:scale-105"
          >
            ← BACK TO STREAMS
          </button>
        </div>
      </MainLayout>
    );
  }

  const backgroundImage = match.poster ? api.getPosterUrl(match.poster) : PLACEHOLDER_IMAGE_URL;
  const isLive = match.status?.toLowerCase() === 'live' || (match.date <= Date.now() && match.sources && match.sources.length > 0);
  const formattedDate = new Date(match.date).toLocaleString([], {
    weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <MainLayout>
      {/* Immersive Match Background */}
      <div 
        className="fixed inset-0 z-[-1] opacity-30 blur-3xl scale-110 pointer-events-none bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>
      <div className="fixed inset-0 z-[-1] bg-gradient-to-b from-[#0a0a0a]/50 via-[#0a0a0a]/90 to-[#0a0a0a] pointer-events-none"></div>

      <div className="flex flex-col gap-8 select-none animate-fade-in max-w-6xl mx-auto w-full mt-4">
        
        {/* Active Stream Glass Header */}
        <div className="glass-panel p-6 md:px-10 md:py-6 rounded-full border border-white/5 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4 z-20">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                {match.title}
              </h1>
              <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest font-bold">
                STREAM: <span className="text-emerald-400">{sourceId}</span> <span className="text-white/30 mx-1">•</span> SERVER <span className="text-white">{stream.streamNo}</span>
              </p>
            </div>
          </div>
          
          <button
            onClick={() => navigate(`/watch/${matchId}`)}
            className="group relative flex items-center gap-2 bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-full transition-all duration-300 hover-spring flex-shrink-0"
          >
            <svg className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Switch Server
          </button>
        </div>

        {/* Cinematic Video Player Frame */}
        <div className="w-full relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="bg-black aspect-video w-full rounded-3xl border border-white/10 overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.6)] z-10">
            <iframe
              src={stream.embedUrl}
              title={`${match.title}`}
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture"
              className="absolute inset-0 w-full h-full object-cover"
            ></iframe>
          </div>
        </div>

        {/* Footer Banner */}
        <div
          className="relative bg-cover bg-center rounded-3xl overflow-hidden shadow-2xl p-6 md:p-10 border border-white/5 min-h-[200px] md:min-h-[250px] flex items-end select-none mt-4 group"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent"></div>
          <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors duration-500 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center md:items-start justify-end w-full gap-2">
            <h2 className="text-2xl md:text-3xl font-black mb-1 leading-tight tracking-tighter text-white drop-shadow-md">
              {match.title}
            </h2>
            <p className="text-xs md:text-sm text-slate-300 font-medium drop-shadow-sm flex items-center justify-center md:justify-start gap-3">
              <span className="uppercase tracking-widest text-emerald-400 font-bold">{match.category || 'Match'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
              <span>{formattedDate}</span>
              {isLive && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                  <span className="bg-red-600 text-white text-[10px] uppercase px-2.5 py-1 rounded-md font-black shadow-lg animate-pulse tracking-widest">
                    LIVE
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default StreamViewPage;