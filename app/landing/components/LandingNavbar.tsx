"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useMemo } from "react";

const tailwindColors = [
    'bg-red-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-gray-500',
];

function getColorForName(name: string | undefined) {
    if (!name) return "bg-gray-500";
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        // simple deterministic hash (pure)
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % tailwindColors.length;
    return tailwindColors[index];
}

export default function LandingNavbar() {
    const session = useSession();
    const username = session.data?.user?.name || undefined;

    const bgClass = useMemo(() => getColorForName(username), [username]);

    return (
        <nav className="w-full py-4 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 relative">
                    <motion.div
                        className="w-10 h-10 absolute z-20 rounded-lg bg-linear-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-marker-hatch"
                        whileHover={{ rotate: 15 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        CS
                    </motion.div>
                    <div className="w-10 h-10 rounded-lg bg-yellow-400">

                    </div>
                </div>
                <div className="flex flex-col text-gray-300">
                    <div className="font-marker-hatch leading-5 text-[22px]">Clean</div>
                    <div className="font-marker-hatch leading-5 text-[22px]">Swipe</div>
                </div>
            </div>

            <div className="flex items-center gap-6 text-gray-200">
                <Link href="#home" className="text-sm hover:text-white hover:scale-105 font-semibold transform-gpu ease-in-out duration-300">Home</Link>
                <Link href="#about" className="text-sm hover:text-white hover:scale-105 font-semibold transform-gpu ease-in-out duration-300">About Us</Link>
                {username ? (
                    <Link
                        href="/dashboard"
                        className={`w-6 h-6 flex items-center outline-2 outline-white justify-center text-center rounded-full text-sm font-medium text-white ${bgClass} hover:scale-105 transform-gpu ease-in-out duration-300`}
                        aria-label="User Dashboard"
                    >
                        {username.charAt(0).toUpperCase()}
                    </Link>
                ) : null}
            </div>
        </nav >
    );
}
