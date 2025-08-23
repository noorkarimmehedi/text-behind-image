import { User } from "@supabase/auth-helpers-nextjs"
import {
    useSessionContext,
    useUser as useSupaUser
} from "@supabase/auth-helpers-react";
import { Profile } from "@/types";

import { useContext, createContext, useState, useEffect } from "react";

type UserContextType = {
    accessToken: string | null;
    user: User | null;
    userDetails: Profile | null;
    isLoading: boolean;
}

export const UserContext = createContext<UserContextType | undefined>(
    undefined
);

export interface Props {
    [propName: string]: any;
}

export const MyUserContextProvider = (props: Props) => {
    const {
        session,
        isLoading: isLoadingUser,
        supabaseClient: supabase
    } = useSessionContext()
    const user = useSupaUser()
    const accessToken = session?.access_token ?? null;
    const [isLoadingData, setIsLoadingData] = useState(false)
    const [userDetails, setUserDetails] = useState<Profile | null>(null)

    // Fetch the current user's profile from the 'profiles' table
    const getUserDetails = async () => {
        return await supabase
            .from('profiles')
            .select('*')
            .eq('id', user?.id as string)
            .single();
    }

    useEffect(() => {
        let didTimeout = false;
        let timeoutId: NodeJS.Timeout | null = null;

        const finishLoading = () => {
            if (!didTimeout) {
                setIsLoadingData(false);
            }
        };

        async function fetchWithTimeout(promise: Promise<any>, ms: number) {
            let timeout: NodeJS.Timeout;
            const timeoutPromise = new Promise((_resolve, reject) => {
                timeout = setTimeout(() => {
                    reject(new Error('Supabase profile fetch timed out'));
                }, ms);
            });
            try {
                const result = await Promise.race([promise, timeoutPromise]);
                clearTimeout(timeout!);
                return result;
            } catch (err) {
                clearTimeout(timeout!);
                throw err;
            }
        }

        if (user && !isLoadingData && !userDetails) {
            setIsLoadingData(true);
            fetchWithTimeout(getUserDetails(), 5000)
                .then((result) => {
                    if (result && result.data) {
                        setUserDetails(result.data as Profile);
                    } else {
                        setUserDetails(null);
                        console.error('Supabase returned no profile data:', result);
                    }
                    finishLoading();
                })
                .catch((err) => {
                    setUserDetails(null);
                    finishLoading();
                    console.error('Supabase profile fetch failed or timed out:', err);
                });
        } else if (!user && !isLoadingUser && !isLoadingData) {
            setUserDetails(null);
        }
    }, [user, isLoadingUser])

    const value = {
        accessToken,
        user,
        userDetails,
        isLoading: isLoadingUser || isLoadingData,
    }

    return <UserContext.Provider value={value} {...props} />
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a MyUserContextProvider')
    }

    return context;
}