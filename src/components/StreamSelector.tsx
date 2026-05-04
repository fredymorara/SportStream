import React from 'react';
import type { Stream } from '../services/api';

interface StreamSelectorProps {
  sources: Record<string, Stream[]>;
  onStreamSelect: (stream: Stream & { sourceId: string }) => void;
  activeStreamId: number | null;
}

const StreamSelector: React.FC<StreamSelectorProps> = ({ 
  sources, 
  onStreamSelect, 
  activeStreamId 
}) => {
  return (
    <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl shadow-lg">
      <h3 className="text-lg font-bold mb-4 text-white">Available Streaming Links</h3>
      
      {Object.keys(sources).length === 0 && (
        <p className="text-slate-400 text-sm">No streaming links are available for this match yet.</p>
      )}

      {Object.keys(sources).map((sourceName) => (
        <div key={sourceName} className="mb-4">
          <h4 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">
            Source: {sourceName}
          </h4>
          {sources[sourceName].length === 0 ? (
            <p className="text-slate-500 text-sm pl-4">No available streams.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {sources[sourceName].map((stream) => (
                <div
                  key={stream.streamNo}
                  className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer border transition-all duration-200 select-none ${
                    activeStreamId === stream.streamNo
                      ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800/40 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 text-slate-200'
                  }`}
                  onClick={() => onStreamSelect({ ...stream, sourceId: sourceName })}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Link #{stream.streamNo} - {stream.language}</span>
                    {stream.hd && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        activeStreamId === stream.streamNo ? 'bg-slate-950 text-emerald-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        HD
                      </span>
                    )}
                  </div>
                  {activeStreamId === stream.streamNo && <span className="text-sm">✓</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StreamSelector;