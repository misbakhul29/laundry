'use client';

import { useNotification } from '@/app/components/provider/NotificationProvider';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { IconSettings } from '@tabler/icons-react';

export default function SettingsClientPage() {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { notify } = useNotification();

    const handleLogout = () => {
        setIsLoggingOut(true);
        signOut({ callbackUrl: '/auth' })
            .then(() => {
                notify({
                    message: 'Logout successful.',
                    type: 'success',
                    duration: 2000,
                });
                setIsLoggingOut(false);
            })
            .catch((error) => {
                setIsLoggingOut(false);
                notify({
                    message: 'Logout failed. Please try again.',
                    type: 'error',
                    duration: 3000,
                });
                console.error('Logout error:', error);
            })
            .finally(() => { setIsLoggingOut(false); });
        console.log("User logged out");
    };
    return (
        <div className="flex-1 flex flex-col gap-6 p-4 w-full max-w-md mx-auto select-none h-full">
            <PageHeader title="Settings" description="Manage your settings" icon={IconSettings} />
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleLogout()}
                className="mt-4 px-6 py-3 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
                {isLoggingOut ? <Loader className="inline-block animate-spin" /> : 'Logout'}
            </motion.button>
        </div>


    );
}