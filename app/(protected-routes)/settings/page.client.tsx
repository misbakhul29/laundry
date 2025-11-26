'use client';

import { useNotification } from '@/app/components/provider/NotificationProvider';
import { IconDoorExit } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SettingsClientPage() {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { push } = useRouter();
    const { notify } = useNotification();

    const handleLogout = () => {
        setIsLoggingOut(true);
        notify({
            message: "User logged out",
            type: "success",
            icon: IconDoorExit,
            duration: 2000,
        });
        console.log("User logged out");
        setTimeout(() => {
            push("/auth");
        }, 2000);
    };
    return (
        <div className="flex-1 flex flex-col h-fit w-full gap-6 items-center justify-center p-8 max-w-md mx-auto select-none">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-2"
            >
                <h1 className="text-5xl font-marker-hatch bg-clip-text text-transparent bg-linear-to-r from-white to-indigo-200">
                    Settings Page
                </h1>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleLogout()}
                    className="mt-4 px-6 py-3 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                    {isLoggingOut ? <Loader className="inline-block animate-spin" /> : 'Logout'}
                </motion.button>
            </motion.div>
        </div>
    );
}