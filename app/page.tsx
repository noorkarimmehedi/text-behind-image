'use client';

import React, { useState } from 'react';
import { motion } from "framer-motion";
import { HeroHighlight, Highlight } from '@/components/ui/hero-highlight';
import { HeroImages } from '@/components/hero-images';
import { HeroParallaxImages } from '@/components/hero-parallax-images';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GeistMono } from 'geist/font';
import SponsorshipBanner from '@/components/ui/sponsorship-banner';
import { TextScramble } from '@/components/ui/text-scramble';
import { useRouter } from 'next/navigation';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Authenticate from '@/components/authenticate';
import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const page = () => {
    const router = useRouter();
    const supabaseClient = useSupabaseClient();
    const [showAuth, setShowAuth] = useState(false);
    
    // Simply show auth dialog when user clicks "Open the app"
    const handleOpenApp = () => {
        setShowAuth(true);
    };
    return ( 
        <div className='flex flex-col min-h-screen items-center w-full'>
            <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1609710199882100" crossOrigin="anonymous"></script>
            <SponsorshipBanner />
            <div className="pt-12 pb-6 md:pt-16 md:pb-8">
                <HeroHighlight>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: [20, -5, 0] }} 
                        transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
                        className={`flex flex-col items-center gap-2 text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-bold text-black uppercase ${GeistMono.className}`}
                    >
                        <span>CREATE</span>
                        <Highlight className='text-white bg-red-600'>
                            <TextScramble
                                duration={1.2}
                                speed={0.02}
                                className="text-white"
                                onHoverStart={() => true}
                            >
                                TEXT-BEHIND-IMAGE
                            </TextScramble>
                        </Highlight>
                        <span>DESIGNS IN SECONDS</span>
                    </motion.div>
                </HeroHighlight>
                
                <div className="text-lg text-center font-semibold mb-4 text-black mt-6">
                    550,000+ text behind image designs created
                </div>

                <div className='flex justify-center mt-6'>
                    <AlertDialog open={showAuth} onOpenChange={setShowAuth}>
                        <AlertDialogTrigger asChild>
                            <Button 
                                variant="neomorphic" 
                                className="neomorphic-button"
                                onClick={handleOpenApp}
                            >
                                Open the app
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="p-0 border-none bg-transparent">
                            <Authenticate 
                                onSuccess={() => {
                                    setShowAuth(false);
                                    router.push('/app');
                                }} 
                                onClose={() => setShowAuth(false)}
                            />
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {/* Mobile badges container */}
            <div className="block md:hidden w-full px-4">
                <div className="flex flex-col items-center justify-center">
                    <div className="flex gap-4">
                        <div className="flex items-center justify-center">
                            <img 
                                src="https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=494264&theme=light&period=daily&align=center" 
                                alt="Text Behind Image - Top Post Badge" 
                                width="160"
                                height="35"
                                className="h-[35px] w-auto"
                                style={{ textAlign: 'center' }}
                            />
                        </div>
                        <div className="flex items-center justify-center">
                            <img 
                                src="https://api.producthunt.com/widgets/embed-image/v1/top-post-topic-badge.svg?post_id=494264&theme=light&period=monthly&topic_id=44&align=center" 
                                alt="Text Behind Image - Top Post Topic Badge" 
                                width="160"
                                height="35"
                                className="h-[35px] w-auto"
                                style={{ textAlign: 'center' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop badges - unchanged */}
            <div className="hidden md:flex space-x-4 mb-4 justify-center w-full">
                <div className="flex items-center justify-center">
                    <img 
                        src="https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=494264&theme=light&period=daily&align=center" 
                        alt="Text Behind Image - Top Post Badge" 
                        width="250" 
                        height="54"
                        style={{ textAlign: 'center' }}
                    />
                </div>
                <div className="flex items-center justify-center">
                    <img 
                        src="https://api.producthunt.com/widgets/embed-image/v1/top-post-topic-badge.svg?post_id=494264&theme=light&period=monthly&topic_id=44&align=center" 
                        alt="Text Behind Image - Top Post Topic Badge" 
                        width="250" 
                        height="54"
                        style={{ textAlign: 'center' }}
                    />
                </div>
            </div>
            
            <div className='w-full h-full -mb-24'>
                <HeroImages />
                <HeroParallaxImages />
            </div>
        </div>
    );
}

export default page;