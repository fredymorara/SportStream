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
    <div className="glass-panel p-6 md:p-8 rounded-[2rem] border border-white/5 shadow-xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-2 h-8 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
        <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">Select Server</h3>
      </div>
      
      {Object.keys(sources).length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-white/10 rounded-2xl bg-white/5">
          <svg className="w-12 h-12 text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
          <p className="text-slate-400 text-center font-medium">No streaming links are available for this match yet.</p>
        </div>
      )}

      <div className="flex flex-col gap-8">
        {Object.keys(sources).map((sourceName) => (
          <div key={sourceName} className="flex flex-col">
            <h4 className="text-xs font-black text-slate-500 mb-4 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
              Source: <span className="text-emerald-400">{sourceName}</span>
            </h4>
            
            {sources[sourceName].length === 0 ? (
              <p className="text-slate-500 text-sm pl-4 italic">No available streams.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sources[sourceName].map((stream) => (
                  <button
                    key={stream.streamNo}
                    onClick={() => onStreamSelect({ ...stream, sourceId: sourceName })}
                    className={`group relative flex items-center justify-between p-4 rounded-2xl transition-all duration-300 hover-spring overflow-hidden ${
                      activeStreamId === stream.streamNo
                        ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-400 text-slate-950'
                        : 'bg-white/5 border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-white shadow-lg'
                    }`}
                  >
                    {/* Hover Glow Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="flex items-center gap-3 relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                        activeStreamId === stream.streamNo ? 'bg-slate-950/20 text-slate-950' : 'bg-white/5 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950'
                      }`}>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-bold text-sm tracking-wide">Server {stream.streamNo}</span>
                        <span className={`text-[10px] font-medium tracking-widest uppercase ${activeStreamId === stream.streamNo ? 'text-slate-800' : 'text-slate-400 group-hover:text-emerald-200'}`}>
                          {stream.language}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 relative z-10">
                      {stream.hd && (
                        <span className={`px-2 py-1 rounded-md text-[9px] font-black tracking-widest uppercase shadow-sm ${
                          activeStreamId === stream.streamNo 
                            ? 'bg-slate-950 text-emerald-400' 
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-slate-950 group-hover:border-transparent'
                        }`}>
                          HD
                        </span>
                      )}
                      {activeStreamId === stream.streamNo && (
                        <svg className="w-5 h-5 ml-1 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StreamSelector;