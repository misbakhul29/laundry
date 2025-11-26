'use client';

import { motion } from 'framer-motion';

export default function OrderClientPage() {
    return (
        <div className="flex-1 flex flex-col h-fit w-full gap-6 items-center justify-center p-8 max-w-md mx-auto select-none">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-2"
            >
                <h1 className="text-5xl font-marker-hatch bg-clip-text text-transparent bg-linear-to-r from-white to-indigo-200">
                    Order Page
                </h1>
            </motion.div>
        </div>
    );
}