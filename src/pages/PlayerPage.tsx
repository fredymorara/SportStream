import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import StreamSelector from '../components/StreamSelector';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMatchesByStatus } from '../store/matchesSlice';
import { fetchMatchStreams, clearStreams } from '../store/streamsSlice';
import { api } from '../services/api';
import type { Stream } from '../services/api';

const PLACEHOLDER_IMAGE_URL = 'https://via.placeholder.com/1200x400?text=Match+Details';

const PlayerPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { rawMatches } = useAppSelector((state) => state.matches);
  const { streamsBySource, loading, error } = useAppSelector((state) => state.streams);

  const match = useMemo(() => {
    return rawMatches.find((m) => m.id === matchId) || null;
  }, [rawMatches, matchId]);

  useEffect(() => {
    if (rawMatches.length === 0) {
      dispatch(fetchMatchesByStatus('all'));
    }
  }, [dispatch, rawMatches.length]);

  useEffect(() => {
    if (match) {
      dispatch(fetchMatchStreams(match));
    }
    return () => {
      dispatch(clearStreams());
    };
  }, [dispatch, match]);

  const handleStreamSelect = (stream: Stream & { sourceId: string }) => {
    navigate(`/stream/${matchId}/${stream.sourceId}/${stream.streamNo}`);
  };

  if (loading && !match) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <LoadingSpinner color="#99ec09" size="80" />
        </div>
      </MainLayout>
    );
  }

  if (error || !match) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto text-center py-12">
          <p className="text-red-500 text-lg font-medium mb-4">Match not found or streams failed to load.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl shadow transition-all duration-200"
          >
            Go to Home
          </button>
        </div>
      </MainLayout>
    );
  }

  const backgroundImage = match.poster ? api.getPosterUrl(match.poster) : PLACEHOLDER_IMAGE_URL;
  const isLive = match.status?.toLowerCase() === 'live' || (match.date <= Date.now() && match.sources && match.sources.length > 0);
  const formattedDate = new Date(match.date).toLocaleString();

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 select-none animate-fade-in">
        
        {/* Navigation Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/40 p-5 rounded-xl border border-slate-800/80 backdrop-blur-sm">
          <div>
            <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider mb-1 block">
              Direct Stream Access
            </span>
            <h1 className="text-xl md:text-2xl font-black text-white leading-tight">
              {match.title}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Pick a stream link below to begin watching the match.
            </p>
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="text-slate-400 hover:text-white font-semibold text-sm transition-colors flex items-center bg-slate-800/60 hover:bg-slate-800 px-4 py-2 rounded-xl border border-slate-700/80 cursor-pointer"
          >
            ← Back to Home
          </button>
        </div>

        {/* Link Selection (Now First) */}
        <StreamSelector
          sources={streamsBySource}
          onStreamSelect={handleStreamSelect}
          activeStreamId={null}
        />

        {/* Visual Match Banner (Now at the Bottom) */}
        <div
          className="relative bg-cover bg-center rounded-xl overflow-hidden shadow-2xl p-6 md:p-10 border border-slate-800 min-h-[250px] md:min-h-[300px] flex items-end select-none"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-black mb-2 leading-tight tracking-tight text-white drop-shadow-md">
                {match.title}
              </h2>
              <p className="text-sm md:text-base text-slate-300 font-medium drop-shadow-sm flex items-center justify-center md:justify-start gap-2">
                <span>📅 {formattedDate}</span>
                {isLive && (
                  <span className="bg-red-600 text-white text-xs px-2.5 py-1 rounded-md font-extrabold shadow-lg animate-pulse">
                    LIVE
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PlayerPage;