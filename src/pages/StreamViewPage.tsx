import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMatchesByStatus } from '../store/matchesSlice';
import { api } from '../services/api';
import type { Stream } from '../services/api';

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
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl shadow transition"
          >
            ← Back to Streams
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-4">
        {/* Stream metadata row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
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
            className="text-slate-400 hover:text-white font-bold text-sm transition bg-slate-800/60 hover:bg-slate-800 px-4 py-2 rounded-xl border border-slate-700"
          >
            ← Switch Link
          </button>
        </div>

        {/* Video Player Frame */}
        <div className="bg-black aspect-video w-full lg:w-[85%] mx-auto rounded-xl border border-slate-800 overflow-hidden relative shadow-2xl mt-2 select-none">
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