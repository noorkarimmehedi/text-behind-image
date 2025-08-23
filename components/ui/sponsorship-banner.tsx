'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';

const SponsorshipBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="w-full max-w-screen-xl mx-auto">
      <header className="flex flex-row items-center justify-between p-4 bg-white dark:bg-black border-b top-0 w-full">
        <div className="flex flex-row items-center justify-center flex-1 gap-2">
          <div className="flex items-center justify-center">
            <p className="text-lg">✨</p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm md:hidden text-center">
              <Link href="https://tally.so/r/npEpr1" target="_blank" rel="noopener noreferrer" className="hover:underline">
                <strong>Want to sponsor this spot? </strong>
                Apply for top section sponsorship
                <span className='text-xs px-2 text-muted-foreground'>
                  AVAILABLE
                </span>
              </Link>
            </p>
            <div className="hidden md:block">
              <p className="text-base text-center">
                <Link href="https://tally.so/r/npEpr1" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  <strong>Want to sponsor this spot? </strong>
                  Apply for top section sponsorship
                  <span className='text-xs px-2 text-muted-foreground'>
                    AVAILABLE
                  </span>
                </Link>
              </p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          aria-label="Close sponsorship banner"
        >
          <X className="h-4 w-4" />
        </button>
      </header>
    </div>
  );
};

export default SponsorshipBanner; 