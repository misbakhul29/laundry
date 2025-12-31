'use client';

import { IconHome, IconWashHand, IconSettings, IconUser, IconWallet } from "@tabler/icons-react";
import { usePathname, useRouter } from 'next/navigation';
import { motion, LayoutGroup } from 'framer-motion';

const navMenu = [
    { label: 'Home', Icon: IconHome, href: '/user/dashboard' },
    { label: 'Order', Icon: IconWashHand, href: '/user/order' },
    { label: 'Payments', Icon: IconWallet, href: '/user/payments' },
    { label: 'Profile', Icon: IconUser, href: '/user/profiles' },
    { label: 'Settings', Icon: IconSettings, href: '/user/settings' },
];

export default function Navbar() {
    const { push } = useRouter();
    const pathname = usePathname();

    // Logic untuk menentukan active index
    const found = navMenu.findIndex(item => item.href === pathname);
    const activeIndex = found === -1 ? 0 : found;

    return (
        <div className="fixed bottom-6 h-18 left-0 right-0 px-6 z-50 flex justify-center">
            <div className="relative bg-white/90 backdrop-blur-md border border-slate-200 text-slate-600 rounded-3xl px-2 py-3 w-full max-w-104 shadow-xl flex items-end justify-between">
                <LayoutGroup>
                    {navMenu.map((item, index) => {
                        const isActive = activeIndex === index;

                        return (
                            <button
                                key={item.label}
                                onClick={() => push(item.href)}
                                aria-label={item.label}
                                className="relative flex-1 flex flex-col gap-2 items-center justify-center cursor-pointer bg-transparent border-0 outline-none group"
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-bubble"
                                        className="absolute -top-14 w-14 h-14 rounded-full bg-linear-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/40"
                                        transition={{
                                            type: 'spring',
                                            stiffness: 400,
                                            damping: 30
                                        }}
                                    />
                                )}

                                <motion.span
                                    className="relative z-10 block"
                                    animate={{ 
                                        y: isActive ? -40 : -20,
                                    }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 25
                                    }}
                                >
                                    <item.Icon 
                                        className={`w-6 h-6 transition-colors duration-300 ${
                                            isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'
                                        }`} 
                                    />
                                </motion.span>

                                <span 
                                    className={`absolute bottom-1 text-[10px] font-semibold transition-all duration-300 ${
                                        isActive 
                                            ? 'text-slate-800' 
                                            : 'text-slate-400'
                                    }`}
                                >
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </LayoutGroup>
            </div>
        </div>
    );
}