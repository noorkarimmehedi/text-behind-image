// app/app/page.tsx
'use client'

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import { useUser } from '@/hooks/useUser';
import { useSessionContext, useSupabaseClient } from '@supabase/auth-helpers-react';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from '@/components/ui/separator';
import { Accordion } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Profile } from '@/types';
import Authenticate from '@/components/authenticate';
import TextCustomizer from '@/components/editor/text-customizer';

import { PlusIcon, ReloadIcon } from '@radix-ui/react-icons';

import { removeBackground } from "@imgly/background-removal";

import '@/app/fonts.css';
import PayDialog from '@/components/pay-dialog';
import AppAds from '@/components/editor/app-ads';
import SponsorshipBanner from '@/components/ui/sponsorship-banner';
import styles from '@/app/styles/upgrade-button.module.css';
import { FileUploadDemo } from "@/components/ui/file-upload-demo";

const Page = () => {
    // Helper function to safely access user properties
    const safeUserProperty = (property: keyof Profile, defaultValue: any = null) => {
        return currentUser && currentUser[property] !== undefined ? currentUser[property] : defaultValue;
    };
    
    const { user } = useUser();
    const { session } = useSessionContext();
    const supabaseClient = useSupabaseClient();
    const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
    const [currentUser, setCurrentUser] = useState<Profile>({
        id: 'guest',
        username: 'guest',
        full_name: 'Guest User',
        avatar_url: '',
        images_generated: 0,
        paid: false,
        subscription_id: ''
    });

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isImageSetupDone, setIsImageSetupDone] = useState<boolean>(false);
    const [removedBgImageUrl, setRemovedBgImageUrl] = useState<string | null>(null);
    const [textSets, setTextSets] = useState<Array<any>>([]);
    const [isPayDialogOpen, setIsPayDialogOpen] = useState<boolean>(false); 
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const getCurrentUser = async (userId: string) => {
        try {
            setIsLoadingUser(true);
            console.log('Fetching user profile for ID:', userId);
            
            // Use single() to get a single row instead of an array
            const { data: profile, error } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error('Error fetching profile:', error);
                throw error;
            }

            console.log('Profile data from Supabase:', profile);
            
            if (profile) {
                // Ensure all required properties exist with default values if missing
                const safeProfile = {
                    id: profile.id || 'guest',
                    username: profile.username || 'guest',
                    full_name: profile.full_name || 'Guest User',
                    avatar_url: profile.avatar_url || '',
                    images_generated: profile.images_generated || 0,
                    paid: profile.paid || false,
                    subscription_id: profile.subscription_id || ''
                };
                
                console.log('Setting current user with images_generated:', safeProfile.images_generated);
                setCurrentUser(safeProfile);
            } else {
                // If no profile found, create a new one for the user
                const newProfile = {
                    id: userId,
                    username: 'user_' + userId.substring(0, 6),
                    full_name: 'New User',
                    avatar_url: '',
                    images_generated: 0,
                    paid: false,
                    subscription_id: ''
                };
                
                // Save the new profile to Supabase
                const { error: insertError } = await supabaseClient
                    .from('profiles')
                    .insert([newProfile]);
                    
                if (insertError) {
                    console.error('Error creating new profile:', insertError);
                } else {
                    setCurrentUser(newProfile);
                }
            }
            
            // Set loading to false after profile is fetched or created
            setIsLoadingUser(false);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setIsLoadingUser(false);
        }
    };

    const handleUploadImage = () => {
        // Allow guest users to try 1 image
        const imagesGenerated = safeUserProperty('images_generated', 0) as number;
        const isPaid = safeUserProperty('paid', false) as boolean;
        
        if (!user || imagesGenerated < 1) {
            if (fileInputRef.current) {
                fileInputRef.current.click();
            }
        } else if (imagesGenerated < 2 || isPaid) {
            if (fileInputRef.current) {
                fileInputRef.current.click();
            }
        } else {
            alert("You have reached the limit of free generations. Please sign in or upgrade for more.");
            setIsPayDialogOpen(true);
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
            await setupImage(imageUrl);
        }
    };

    const setupImage = async (imageUrl: string) => {
        try {
            const imageBlob = await removeBackground(imageUrl);
            const url = URL.createObjectURL(imageBlob);
            setRemovedBgImageUrl(url);
            setIsImageSetupDone(true);

            const userId = safeUserProperty('id') as string;
            if (userId && userId !== 'guest') {
                const currentCount = safeUserProperty('images_generated', 0) as number;
                const newCount = currentCount + 1;
                
                // Update in Supabase
                const { data, error } = await supabaseClient
                    .from('profiles')
                    .update({ images_generated: newCount })
                    .eq('id', userId) 
                    .select();
                    
                if (!error && data) {
                    // Update local state to reflect the change
                    setCurrentUser(prevUser => ({
                        ...prevUser,
                        images_generated: newCount
                    }));
                    console.log('Updated image generation count:', newCount);
                } else if (error) {
                    console.error('Error updating image generation count:', error);
                }
            }
            
        } catch (error) {
            console.error(error);
        }
    };

    const addNewTextSet = () => {
        const newId = Math.max(...textSets.map(set => set.id), 0) + 1;
        setTextSets(prev => [...prev, {
            id: newId,
            text: 'edit',
            fontFamily: 'Inter',
            top: 0,
            left: 0,
            color: 'white',
            fontSize: 200,
            fontWeight: 800,
            opacity: 1,
            shadowColor: 'rgba(0, 0, 0, 0.8)',
            shadowSize: 4,
            rotation: 0,
            tiltX: 0,
            tiltY: 0,
            letterSpacing: 0
        }]);
    };

    const handleAttributeChange = (id: number, attribute: string, value: any) => {
        setTextSets(prev => prev.map(set => 
            set.id === id ? { ...set, [attribute]: value } : set
        ));
    };

    const duplicateTextSet = (textSet: any) => {
        const newId = Math.max(...textSets.map(set => set.id), 0) + 1;
        setTextSets(prev => [...prev, { ...textSet, id: newId }]);
    };

    const removeTextSet = (id: number) => {
        setTextSets(prev => prev.filter(set => set.id !== id));
    };

    const saveCompositeImage = () => {
        if (!canvasRef.current || !isImageSetupDone) return;
    
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
    
        const bgImg = new (window as any).Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.onload = () => {
            canvas.width = bgImg.width;
            canvas.height = bgImg.height;
    
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    
            textSets.forEach(textSet => {
                ctx.save();
                
                // Set up text properties
                ctx.font = `${textSet.fontWeight} ${textSet.fontSize * 3}px ${textSet.fontFamily}`;
                ctx.fillStyle = textSet.color;
                ctx.globalAlpha = textSet.opacity;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.letterSpacing = `${textSet.letterSpacing}px`;
    
                const x = canvas.width * (textSet.left + 50) / 100;
                const y = canvas.height * (50 - textSet.top) / 100;
    
                // Move to position first
                ctx.translate(x, y);
                
                // Apply 3D transforms
                const tiltXRad = (-textSet.tiltX * Math.PI) / 180;
                const tiltYRad = (-textSet.tiltY * Math.PI) / 180;
    
                // Use a simpler transform that maintains the visual tilt
                ctx.transform(
                    Math.cos(tiltYRad),          // Horizontal scaling
                    Math.sin(0),          // Vertical skewing
                    -Math.sin(0),         // Horizontal skewing
                    Math.cos(tiltXRad),          // Vertical scaling
                    0,                           // Horizontal translation
                    0                            // Vertical translation
                );
    
                // Apply rotation last
                ctx.rotate((textSet.rotation * Math.PI) / 180);
    
                if (textSet.letterSpacing === 0) {
                    // Use standard text rendering if no letter spacing
                    ctx.fillText(textSet.text, 0, 0);
                } else {
                    // Manual letter spacing implementation
                    const chars = textSet.text.split('');
                    let currentX = 0;
                    // Calculate total width to center properly
                    const totalWidth = chars.reduce((width, char, i) => {
                        const charWidth = ctx.measureText(char).width;
                        return width + charWidth + (i < chars.length - 1 ? textSet.letterSpacing : 0);
                    }, 0);
                    

                
                    // Start position (centered)
                    currentX = -totalWidth / 2;
                    
                    // Draw each character with spacing
                    chars.forEach((char, i) => {
                        const charWidth = ctx.measureText(char).width;
                        ctx.fillText(char, currentX + charWidth / 2, 0);
                        currentX += charWidth + textSet.letterSpacing;
                    });
                }
                ctx.restore();
            });
    
            if (removedBgImageUrl) {
                const removedBgImg = new (window as any).Image();
                removedBgImg.crossOrigin = "anonymous";
                removedBgImg.onload = () => {
                    ctx.drawImage(removedBgImg, 0, 0, canvas.width, canvas.height);
                    triggerDownload();
                };
                removedBgImg.src = removedBgImageUrl;
            } else {
                triggerDownload();
            }
        };
        bgImg.src = selectedImage || '';
    
        function triggerDownload() {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = 'text-behind-image.png';
            link.href = dataUrl;
            link.click();
        }
    };

    useEffect(() => {
      if (user?.id) {
        getCurrentUser(user.id)
      }
    }, [user])
    
    return (
        <>
            <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1609710199882100" crossOrigin="anonymous"></script>
            
            {/* Mobile Warning Message */}
            <div className="md:hidden flex flex-col items-center justify-center min-h-screen p-6 text-center bg-background">
                <div className="text-4xl mb-6">💻</div>
                <h2 className="text-2xl font-bold mb-4">Desktop Only</h2>
                <p className="text-muted-foreground">
                    Text Behind Image editor is optimized for desktop use. Please visit this page on a desktop or laptop computer for the best experience.
                </p>
            </div>

            {/* Desktop Dashboard */}
            <div className='hidden md:flex md:flex-col min-h-[calc(100vh-theme(spacing.32))]'>
                {currentUser && !currentUser.paid && (
                    <div className="flex justify-center w-full mb-4">
                        <SponsorshipBanner />
                    </div>
                )}
                <header className='flex flex-row items-center justify-between p-5 px-10 bg-background'>
                    <h2 className="text-2xl font-semibold">
                        Text behind objects editor
                    </h2>
                    <div className='flex items-center gap-0'>
                        <div className='font-semibold'>
                            {isLoadingUser ? (
                                <p className='text-sm flex items-center'>
                                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                    Loading...
                                </p>
                            ) : user && currentUser && currentUser.paid ? (
                                <p className='text-sm'>
                                    Unlimited generations
                                </p>
                            ) : (
                                <div className='flex items-center gap-2'>
                                    <p className='text-sm'>
                                        {user ? `${2 - (currentUser && currentUser.images_generated || 0)} generations left` : '1 free generation (guest)'}
                                    </p>
                                    <button 
                                        className={styles.upgradeButton}
                                        onClick={() => setIsPayDialogOpen(true)}
                                    >
                                        <span className={styles.buttonTop}>
                                            {user ? 'Upgrade' : 'Sign in'}
                                        </span>
                                    </button>
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                            accept=".jpg, .jpeg, .png"
                        />
                        <div className='flex gap-0'>
                            <Button 
                                onClick={handleUploadImage}
                                variant="neomorphic"
                                className="neomorphic-button scale-75 -mr-3"
                                size="sm"
                            >
                                Upload image
                            </Button>
                            {selectedImage && (
                                <Button 
                                    onClick={saveCompositeImage} 
                                    variant="neomorphic"
                                    className="neomorphic-button hidden md:flex scale-75 -ml-3"
                                    size="sm"
                                >
                                    Save image
                                </Button>
                            )}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center justify-center cursor-pointer rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[2px] hover:shadow-lg transition-all duration-200 hover:scale-105">
                                    <Avatar className="h-8 w-8 bg-white rounded-full">
                                        <AvatarImage src={safeUserProperty('avatar_url', '')} className="object-cover" /> 
                                        <AvatarFallback className="bg-white text-gray-800 font-medium text-sm">
                                            {safeUserProperty('username', 'User').substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64">
                                <DropdownMenuLabel className="flex flex-col">
                                    <span className="font-medium">{safeUserProperty('full_name', 'User')}</span>
                                    <span className="text-xs text-gray-500 truncate">{user?.email || 'No email available'}</span>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {
                                    supabaseClient.auth.signOut().then(() => {
                                        window.location.href = '/';
                                    });
                                }}>
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                <Separator />
                {selectedImage ? (
                    <div className='flex flex-col md:flex-row items-start justify-start gap-10 w-full flex-1 px-10 mt-2 pb-8'>
                        <div className="flex flex-col items-center justify-start w-full md:w-1/2 gap-4">
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                            <div className='flex items-center gap-2'>
                                <Button 
                                    onClick={saveCompositeImage} 
                                    variant="neomorphic"
                                    className="neomorphic-button scale-75 md:hidden"
                                    size="sm"
                                >
                                    Save image
                                </Button>
                                <div className='block md:hidden'>
                                    {isLoadingUser ? (
                                        <p className='text-sm flex items-center'>
                                            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                            Loading...
                                        </p>
                                    ) : user && currentUser && currentUser.paid ? (
                                        <p className='text-sm'>
                                            Unlimited generations
                                        </p>
                                    ) : (
                                        <div className='flex items-center gap-5'>
                                            <p className='text-sm'>
                                                {user ? `${2 - (currentUser && currentUser.images_generated || 0)} generations left` : '1 free generation (guest)'}
                                            </p>
                                            <button 
                                                className={styles.upgradeButton}
                                                onClick={() => setIsPayDialogOpen(true)}
                                            >
                                                <span className={styles.buttonTop}>
                                                    Upgrade
                                                </span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="min-h-[400px] w-full max-w-2xl mx-auto p-4 border border-border rounded-lg relative overflow-hidden">
                                {isImageSetupDone ? (
                                    <Image
                                        src={selectedImage} 
                                        alt="Uploaded"
                                        layout="fill"
                                        objectFit="contain" 
                                        objectPosition="center" 
                                    />
                                ) : (
                                    <span className='flex items-center w-full gap-2'><ReloadIcon className='animate-spin' /> Loading, please wait</span>
                                )}
                                {isImageSetupDone && textSets.map(textSet => (
                                    <div
                                        key={textSet.id}
                                        style={{
                                            position: 'absolute',
                                            top: `${50 - textSet.top}%`,
                                            left: `${textSet.left + 50}%`,
                                            transform: `
                                                translate(-50%, -50%) 
                                                rotate(${textSet.rotation}deg)
                                                perspective(1000px)
                                                rotateX(${textSet.tiltX}deg)
                                                rotateY(${textSet.tiltY}deg)
                                            `,
                                            color: textSet.color,
                                            textAlign: 'center',
                                            fontSize: `${textSet.fontSize}px`,
                                            fontWeight: textSet.fontWeight,
                                            fontFamily: textSet.fontFamily,
                                            opacity: textSet.opacity,
                                            letterSpacing: `${textSet.letterSpacing}px`,
                                            transformStyle: 'preserve-3d'
                                        }}
                                    >
                                        {textSet.text}
                                    </div>
                                ))}
                                {removedBgImageUrl && (
                                    <Image
                                        src={removedBgImageUrl}
                                        alt="Removed bg"
                                        layout="fill"
                                        objectFit="contain" 
                                        objectPosition="center" 
                                        className="absolute top-0 left-0 w-full h-full"
                                    /> 
                                )}
                            </div>
                            {currentUser && !currentUser.paid && (
                                <AppAds />
                            )}
                        </div>
                        <div className='flex flex-col w-full md:w-1/2'>
                            <Button variant={'secondary'} onClick={addNewTextSet}><PlusIcon className='mr-2'/> Add New Text Set</Button>
                            <div className="mt-4 space-y-4 overflow-y-auto pb-8">
                                {textSets.map(textSet => (
                                    <TextCustomizer 
                                        key={textSet.id}
                                        textSet={textSet}
                                        handleAttributeChange={handleAttributeChange}
                                        removeTextSet={removeTextSet}
                                        duplicateTextSet={duplicateTextSet}
                                        userId={safeUserProperty('id', 'guest') as string}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className='flex items-center justify-center flex-1'>
                        {/* Main content area */}
                        <div className="flex-1 p-8">
                            {!selectedImage ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    {/* Integration Guide:
                                    This component uses:
                                    - shadcn project structure
                                    - Tailwind CSS for styling
                                    - TypeScript for type safety
                                    - framer-motion for animations
                                    - react-dropzone for file handling
                                    - @tabler/icons-react for icons
                                    
                                    The component supports:
                                    - Drag and drop file upload
                                    - Click to upload
                                    - File size display
                                    - File type display
                                    - Last modified date
                                    - Dark mode
                                    - Responsive design
                                    */}
                                    <FileUploadDemo 
                                        onImageSelect={(file) => {
                                            const imageUrl = URL.createObjectURL(file);
                                            setSelectedImage(imageUrl);
                                            setupImage(imageUrl);
                                        }}
                                        canUpload={!user || (currentUser && (currentUser.images_generated < 1)) || 
                                                 (currentUser && (currentUser.images_generated < 2 || currentUser.paid))}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full">
                                    {/* Integration Guide:
                                    This component uses:
                                    - shadcn project structure
                                    - Tailwind CSS for styling
                                    - TypeScript for type safety
                                    - framer-motion for animations
                                    - react-dropzone for file handling
                                    - @tabler/icons-react for icons
                                    
                                    The component supports:
                                    - Drag and drop file upload
                                    - Click to upload
                                    - File size display
                                    - File type display
                                    - Last modified date
                                    - Dark mode
                                    - Responsive design
                                    */}
                                    <FileUploadDemo 
                                        onImageSelect={(file) => {
                                            const imageUrl = URL.createObjectURL(file);
                                            setSelectedImage(imageUrl);
                                            setupImage(imageUrl);
                                        }}
                                        canUpload={!user || (currentUser && (currentUser.images_generated < 1)) || 
                                                 (currentUser && (currentUser.images_generated < 2 || currentUser.paid))}
                                    />
                                </div>
                            )} 
                        </div>
                    </div>
                )} 
                <PayDialog userDetails={currentUser as any} userEmail={user?.user_metadata.email} isOpen={isPayDialogOpen} onClose={() => setIsPayDialogOpen(false)} /> 
            </div>
            {isPayDialogOpen && (
                <Authenticate />
            )}
        </>
    );
}

export default Page;