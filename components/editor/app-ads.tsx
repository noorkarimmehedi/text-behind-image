'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import Link from 'next/link'

const AppAds = () => {
    const [isVisible, setIsVisible] = useState(true)

    if (!isVisible) return null;

    return (
        <div className="w-full max-w-2xl mx-auto min-h-[400px] p-4 border border-border rounded-lg bg-background relative">
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4">✨</div>
                    <Link href="https://tally.so/r/npEpr1" target="_blank" rel="noopener noreferrer" className="hover:underline">
                        <div className="text-xl font-semibold mb-2">
                            Want to sponsor this spot?
                        </div>
                        <div className="text-lg">
                            Apply for main section sponsorship
                            <span className='text-sm px-2 text-muted-foreground'>
                                AVAILABLE
                            </span>
                        </div>
                    </Link>
                </div>
            </div>
            <button 
                onClick={() => setIsVisible(false)}
                className="absolute top-4 right-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                aria-label="Close advertisement"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    )
}

export default AppAds

