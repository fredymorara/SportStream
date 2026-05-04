import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import StreamSelector from '../components/StreamSelector';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMatchesByStatus } from '../store/matchesSlice';
import { fetchMatchStreams, clearStreams } from '../store/streamsSlice';
import type { Stream } from '../services/api';

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

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 select-none">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/40 p-5 rounded-xl border border-slate-800/80">
          <div>
            <span className="text-xs font-bold uppercase text-brand-accent tracking-wider mb-1 block">
              Live Stream Selector
            </span>
            <h1 className="text-xl md:text-2xl font-black text-white leading-tight">
              {match.title}
            </h1>
            <p className="text-slate-400 text-xs">
              Pick a stream link below to begin watching the match.
            </p>
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="text-slate-400 hover:text-white font-semibold text-sm transition-colors flex items-center bg-slate-800/60 hover:bg-slate-800 px-4 py-2 rounded-xl border border-slate-700/80"
          >
            ← Back to Home
          </button>
        </div>

        <StreamSelector
          sources={streamsBySource}
          onStreamSelect={handleStreamSelect}
          activeStreamId={null}
        />
      </div>
    </MainLayout>
  );
};

export default PlayerPage;