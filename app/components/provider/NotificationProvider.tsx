"use client";

import React, { createContext, useContext, useCallback, useState, ReactNode, ElementType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Alert from "../Alert";

type NotificationType = "success" | "error" | "info" | "warning";

type Notification = {
    id: string;
    message: string;
    type?: NotificationType;
    icon?: ReactNode | ElementType;
    duration?: number; // ms
};

type NotifyOptions = Omit<Notification, "id">;

type NotificationContextValue = {
    notify: (opts: NotifyOptions) => string;
    remove: (id: string) => void;
};

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const useNotification = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error("useNotification must be used within NotificationProvider");
    return ctx;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<Notification[]>([]);

    const remove = useCallback((id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    }, []);

    const notify = useCallback((opts: NotifyOptions) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const entry: Notification = { id, ...opts };
        // Add new notifications to the top
        setItems((prev) => [entry, ...prev]);

        if (opts.duration && opts.duration > 0) {
            setTimeout(() => remove(id), opts.duration);
        }

        return id;
    }, [remove]);

    return (
        <NotificationContext.Provider value={{ notify, remove }}>
            {children}

            <div className="absolute top-4 right-0 left-0 self-center flex flex-col gap-3 items-center w-full px-4">
                <AnimatePresence initial={false}>
                    {items.map((n) => (
                        <motion.div key={n.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                            <Alert
                                message={n.message}
                                type={n.type}
                                icon={n.icon}
                                onClose={() => remove(n.id)}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};

export default NotificationProvider;
