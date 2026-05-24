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

const PLACEHOLDER_IMAGE_URL = '/sports_placeholder.png';

import { Helmet } from 'react-helmet-async';

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
          <LoadingSpinner color="#10B981" size="80" />
        </div>
      </MainLayout>
    );
  }

  if (error || !match) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto text-center py-12 glass-panel rounded-2xl p-8 mt-12">
          <p className="text-red-500 text-lg font-medium mb-6">Match not found or streams failed to load.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black tracking-wide py-3 px-6 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300 hover:scale-105"
          >
            RETURN TO HOME
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
      <Helmet>
        <title>Watch {match.title} Live | Mpira</title>
        <meta name="description" content={`Watch the live stream for ${match.title} (${match.category || 'Sports'}). Free HD live streaming.`} />
        <meta property="og:title" content={`Watch ${match.title} Live | Mpira`} />
        <meta property="og:description" content={`Watch the live stream for ${match.title}. Free HD live streaming.`} />
        <meta property="og:image" content={backgroundImage} />
        <meta property="og:type" content="video.other" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Watch ${match.title} Live`} />
        <meta name="twitter:description" content={`Watch the live stream for ${match.title}. Free HD live streaming.`} />
        <meta name="twitter:image" content={backgroundImage} />
      </Helmet>

      {/* Immersive Match Background */}
      <div 
        className="fixed inset-0 z-[-1] opacity-30 blur-3xl scale-110 pointer-events-none bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>
      <div className="fixed inset-0 z-[-1] bg-gradient-to-b from-[#0a0a0a]/50 via-[#0a0a0a]/80 to-[#0a0a0a] pointer-events-none"></div>

      <div className="flex flex-col gap-8 select-none animate-fade-in max-w-5xl mx-auto w-full mt-4">
        
        {/* Cinematic Header Panel */}
        <div className="glass-panel p-6 md:p-10 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group">
          
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
            
            {/* Match Poster Thumbnail */}
            <div className="w-full max-w-[240px] md:w-48 aspect-[3/4] md:aspect-square flex-shrink-0 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-white/10 relative group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-500">
              <img src={backgroundImage} alt={match.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              {isLive && (
                <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] uppercase font-black px-2.5 py-1 rounded shadow-[0_0_15px_rgba(239,68,68,0.9)] animate-pulse tracking-widest flex items-center gap-1.5 z-20">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  LIVE NOW
                </div>
              )}
            </div>

            {/* Match Info */}
            <div className="flex flex-col flex-1 justify-center h-full text-center md:text-left pt-2 md:pt-4">
              <span className="text-emerald-400 font-black text-xs tracking-widest uppercase mb-3 drop-shadow-md flex items-center justify-center md:justify-start gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                Direct Stream Access
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter mb-4 drop-shadow-lg">
                {match.title}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-3 text-slate-300 font-medium text-sm border-b border-white/5 pb-6 mb-6">
                <span className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 text-xs uppercase tracking-wider">{match.category || 'Match'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                <span className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> {formattedDate}</span>
              </div>
              <button 
                onClick={() => navigate('/')} 
                className="self-center md:self-start text-slate-400 hover:text-emerald-400 font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2"
              >
                ← Return to Home
              </button>
            </div>
          </div>
        </div>

        {/* Link Selection */}
        <StreamSelector
          sources={streamsBySource}
          onStreamSelect={handleStreamSelect}
          activeStreamId={null}
        />

        {/* Footer Banner */}
        <div
          className="relative bg-cover bg-center rounded-3xl overflow-hidden shadow-2xl p-6 md:p-10 border border-white/5 min-h-[250px] md:min-h-[300px] flex items-end select-none mt-8 group"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent"></div>
          <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors duration-500 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center md:items-start justify-end w-full gap-2">
            <h2 className="text-2xl md:text-4xl font-black mb-1 leading-tight tracking-tighter text-white drop-shadow-md">
              {match.title}
            </h2>
            <p className="text-sm md:text-base text-slate-300 font-medium drop-shadow-sm flex items-center justify-center md:justify-start gap-3">
              <span className="uppercase tracking-widest text-emerald-400 text-xs font-bold">{match.category || 'Match'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
              <span>{formattedDate}</span>
              {isLive && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                  <span className="bg-red-600 text-white text-xs px-2.5 py-1 rounded-md font-extrabold shadow-lg animate-pulse">
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

export default PlayerPage;