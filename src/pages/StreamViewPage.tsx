import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMatchesByStatus } from '../store/matchesSlice';
import { api } from '../services/api';
import type { Stream } from '../services/api';

const PLACEHOLDER_IMAGE_URL = 'https://via.placeholder.com/1200x400?text=Match+Details';

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
          <LoadingSpinner color="#99ec09" size="80" />
        </div>
      </MainLayout>
    );
  }

  if (error || !stream) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto text-center py-12">
          <p className="text-red-500 text-lg font-medium mb-4">{error || "Data is incomplete."}</p>
          <button
            onClick={() => navigate(`/watch/${matchId}`)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl shadow transition cursor-pointer"
          >
            ← Back to Streams
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
        
        {/* Row 1: Active Stream Metadata Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/40 p-5 rounded-xl border border-slate-800/80 backdrop-blur-sm">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white leading-tight">
              {match.title}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Currently watching: <span className="text-emerald-400 uppercase font-bold">{sourceId}</span> - Link {stream.streamNo}
            </p>
          </div>
          <button
            onClick={() => navigate(`/watch/${matchId}`)}
            className="text-slate-400 hover:text-white font-bold text-sm transition bg-slate-800/60 hover:bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 cursor-pointer"
          >
            ← Switch Link
          </button>
        </div>

        {/* Row 2: Visual Match Banner (Style-aligned with the Hero Banner) */}
        <div
          className="relative bg-cover bg-center rounded-xl overflow-hidden shadow-2xl p-6 md:p-10 border border-slate-800 min-h-[200px] md:min-h-[250px] flex items-end select-none"
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

        {/* Row 3: Video Player Frame */}
        <div className="bg-black aspect-video w-full lg:w-[60%] mx-auto lg:mx-0 rounded-xl border border-slate-800 overflow-hidden relative shadow-2xl select-none">
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
    </MainLayout>
  );
};

export default StreamViewPage;