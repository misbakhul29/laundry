'use client';

import { IconHome, IconWashHand, IconSettings, IconUser } from "@tabler/icons-react";
import { usePathname, useRouter } from 'next/navigation';
import { motion, LayoutGroup } from 'framer-motion';

const navMenu = [
    { label: 'Home', Icon: IconHome, href: '/dashboard' },
    { label: 'Order', Icon: IconWashHand, href: '/order' },
    { label: 'Profile', Icon: IconUser, href: '/profiles' },
    { label: 'Settings', Icon: IconSettings, href: '/settings' },
];

export default function Navbar() {
    const { push } = useRouter();
    const pathname = usePathname();

    const found = navMenu.findIndex(item => item.href === pathname);
    const activeIndex = found === -1 ? 0 : found;
    return (
        <div className="absolute bottom-4 left-6 right-6">
            <div className="relative bg-slate-200 text-black rounded-3xl px-6 py-3 flex items-center justify-between shadow-2xl">
                <LayoutGroup>
                    {navMenu.map((item, index) => (
                        <button
                            key={item.label}
                            onClick={() => {
                                push(item.href)
                            }}
                            aria-label={item.label}
                            className="relative z-10 flex-1 flex flex-col items-center justify-center py-2 px-3 cursor-pointer bg-transparent border-0"
                        >
                            {activeIndex === index && (
                                <motion.div
                                    layoutId="nav-bubble"
                                    initial={false}
                                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                                    className="absolute -top-6 w-14 h-14 rounded-full bg-linear-to-br from-orange-400 to-orange-600 shadow-xl flex items-center justify-center"
                                >
                                    <item.Icon
                                        className={`w-6 h-6 transition-all duration-200 ${activeIndex === index ? 'opacity-100 text-black' : 'text-black/70'}`}
                                    />
                                </motion.div>
                            )}

                            <item.Icon
                                className={`w-6 h-6 transition-all duration-200 ${activeIndex === index ? 'opacity-0' : 'text-black/70'}`}
                            />
                            <span className={`mt-1 text-[10px] font-medium transition-opacity duration-200 ${activeIndex === index ? 'opacity-100 text-black font-semibold' : 'opacity-70 text-black/70'}`}>
                                {item.label}
                            </span>
                        </button>
                    ))}
                </LayoutGroup>
            </div>
        </div>
    );
}