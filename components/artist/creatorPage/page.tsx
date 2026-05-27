"use client";

import React, { useEffect, useState } from 'react';
import { SERVER_URL } from '@/data/SERVER_URL';
import { FaCompactDisc, FaMusic, FaShieldAlt } from 'react-icons/fa';
import { MdOutlineSupport } from 'react-icons/md';
import { TArtist } from '@/data/types/artist';
import { Track } from '@/data/types/track';
import BottomPlayer from '@/components/main/bottom_Player/BottomPlayer';

export default function CreatorComponentPage({ artistName }: { artistName: string }) {
  const [artist, setArtist] = useState<TArtist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  console.log(artistName)
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const name = artistName;

        const artistRes = await fetch(`${SERVER_URL}/artists/${name}`);
        if (!artistRes.ok) throw new Error('Artist not found');
        const artistData = await artistRes.json();
        setArtist(artistData.artist);

        const tracksRes = await fetch(`${SERVER_URL}/artists/${name}/tracks`);
        const tracksData = await tracksRes.json();
        setTracks(tracksData.tracks || []);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (artistName) fetchData();
  }, [artistName]);

  if (loading) return <div className="text-white p-5">Loading...</div>;
  if (!artist) return <div className="text-white p-5">Artist not found</div>;

  return (
    <div className="flex-1 overflow-y-auto pb-28 bg-zinc-50 dark:bg-zinc-950/50 text-white">

      <div className="px-6 py-5 border-b border-white/5">
        <h1 className="text-2xl font-bold">{artist.username}</h1>
        <p className="text-zinc-400 text-sm mt-1 mr-1 flex">{artist.isMod ? (<div className='flex items-center justify-center'><MdOutlineSupport size={14} className='ml-2 mr-1' />Модератор </div>) : ""} {artist.isAdmin ? (<div className='flex items-center justify-center'><FaShieldAlt size={10} className='ml-2 mr-1' />Администратор</div>) : ""} {<div className='flex items-center justify-center'><FaCompactDisc size={10} className='ml-2 mr-1' />Испольнитель</div>}</p>
      </div>

      <div className="px-4 py-3">
        {loading ? (
          <div className="flex flex-col gap-2 mt-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl animate-pulse">
                <div className="w-5 h-3 bg-zinc-800 rounded" />
                <div className="w-11 h-11 bg-zinc-800 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-zinc-800 rounded w-2/5" />
                  <div className="h-2.5 bg-zinc-800 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : tracks.length === 0 ? (
          <div className="flex items-center justify-center gap-3 px-5 text-zinc-400">
            <FaMusic className="opacity-30" />
            <p className="text-sm">У артиста нет треков</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {tracks.map((track, index) => {
              const isActive = currentTrackIndex === index;

              return (
                <li
                  key={track.id}
                  onClick={() => setCurrentTrackIndex(index)}
                  className={`group flex items-center w-100 gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all
                    ${isActive
                      ? 'bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10'
                      : 'border border-transparent hover:bg-white dark:hover:bg-zinc-900 hover:border-black/5 dark:hover:border-white/5'
                    }`}
                >
                  {/* Index / EQ */}
                  <div className="w-5 flex items-center justify-center">
                    {isActive ? (
                    //   <span className="flex items-end gap-[2px] h-[14px]">
                    //     {/* {[0, 150, 300].map((d) => (
                    //       <span
                    //         key={d}
                    //         className="w-[3px] bg-green-500 rounded-sm"
                    //         style={{
                    //           animation: `eq 0.7s ease-in-out ${d}ms infinite alternate`,
                    //           height: '4px',
                    //         }}
                    //       />
                    //     ))} */}
                    //   </span>
                        <span className="text-[12px] text-zinc-400">{index + 1}</span>
                    ) : (
                      <span className="text-[12px] text-zinc-400">{index + 1}</span>
                    )}
                  </div>

                  <div className="w-11 h-11 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-black/5 dark:border-white/10 flex items-center justify-center">
                    <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 border border-black/5 dark:border-white/10">
                      {track.coverUrl ? (
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <FaMusic size={14} className="text-zinc-500" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-[13.5px] font-medium truncate ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                      {track.title}
                    </p>
                    <p className="text-[12px] text-zinc-500 truncate mt-0.5">
                      {track.artist} 
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>


      <style>{`
        @keyframes eq {
          from { height: 4px; }
          to   { height: 13px; }
        }
      `}</style>
    </div>
  );
}