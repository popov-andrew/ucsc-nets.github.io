'use client';

import { useState, useEffect } from 'react';
import LessonElement, { LessonItem } from './lessonElement';

interface LessonGalleryProps {
  sheetUrl: string;
  columnMapping: string[];
  onLessonSelect?: (uid: string) => void;
}

const parseTSV = (tsvText: string, columnMapping: string[]): LessonItem[] => {
  const lines = tsvText.trim().split('\n');
  if (lines.length === 0 || lines[0] === '') return []; 

  return lines.map((line, index) => {
    const values = line.split('\t');
    const rowObject: Partial<LessonItem> = { uid: `row-${index}` }; 
    
    columnMapping.forEach((keyName, colIndex) => {
      rowObject[keyName] = values[colIndex]?.replace(/[\r\n]+/g, '').trim() || '';
    });
    
    return rowObject as LessonItem;
  });
};

const LoadingSkeleton = () => (
  <div className="relative flex flex-col p-6 bg-white/50 border border-white/10 rounded-2xl shadow-sm animate-pulse min-h-50">
    <div className="flex justify-between mb-4">
      <div className="h-8 w-1/2 bg-gray-200 rounded-md"></div>
      <div className="h-6 w-1/4 bg-gray-200 rounded-lg"></div>
    </div>
    <div className="h-4 w-3/4 bg-gray-200 rounded-md mb-2"></div>
    <div className="h-4 w-full bg-gray-200 rounded-md mb-6"></div>
    <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between">
      <div className="h-4 w-1/3 bg-gray-200 rounded-md"></div>
      <div className="h-4 w-1/4 bg-gray-200 rounded-md"></div>
    </div>
  </div>
);

export default function LessonGallery({ sheetUrl, columnMapping, onLessonSelect }: LessonGalleryProps) {
  const [data, setData] = useState<LessonItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(sheetUrl);
        if (!response.ok) throw new Error('Failed to fetch lesson data');
        
        const textData = await response.text();
        const parsedData = parseTSV(textData, columnMapping);
        
        setData(parsedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [sheetUrl, columnMapping]);

  if (error) {
    return <div className="text-red-500 font-bold p-4 bg-red-50 rounded-lg border border-red-200">Error: {error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-20">
      {isLoading ? (
        Array.from({ length: 6 }).map((_, i) => <LoadingSkeleton key={`skeleton-${i}`} />)
      ) : (
        data.map((item) => (
          <LessonElement 
            key={item.uid} 
            item={item} 
            columnMapping={columnMapping} 
            onJoinClick={onLessonSelect}
          />
        ))
      )}
    </div>
  );
}