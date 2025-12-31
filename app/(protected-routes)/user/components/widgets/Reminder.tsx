"use client";

import { useNotification } from "@/app/components/provider/NotificationProvider";
import { AlarmClock } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const STORAGE_TIME_KEY = "laundryReminderTime";
const STORAGE_ENABLED_KEY = "laundryReminderEnabled";

export default function Reminder() {
    const [time, setTime] = useState<string>(() => {
        try {
            const v = localStorage.getItem(STORAGE_TIME_KEY);
            return v ?? "09:00";
        } catch {
            return "09:00";
        }
    });

    const [enabled, setEnabled] = useState<boolean>(() => {
        try {
            const v = localStorage.getItem(STORAGE_ENABLED_KEY);
            return v === "true";
        } catch {
            return false;
        }
    });
    const [permission, setPermission] = useState<NotificationPermission>(
        typeof Notification !== "undefined" ? Notification.permission : "default"
    );
    const timerRef = useRef<number | null>(null);
    const { notify } = useNotification();

    // initial state reads from localStorage synchronously (client-only component)

    // Whenever time or enabled changes, persist and (re)schedule
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_TIME_KEY, time);
            localStorage.setItem(STORAGE_ENABLED_KEY, String(enabled));
        } catch {
            // ignore storage errors
        }

        if (enabled) {
            // Register service worker and subscribe for push when enabling
            if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
                (async () => {
                    try {
                        const reg = await navigator.serviceWorker.register('/sw.js');
                        // ensure notifications permission requested
                        if (Notification.permission === 'default') {
                            const p = await Notification.requestPermission();
                            setPermission(p);
                        }

                        // subscribe to push manager if permission granted
                        if (Notification.permission === 'granted' && reg.pushManager) {
                            try {
                                const res = await fetch('/api/push/vapidPublic');
                                const json = await res.json();
                                const vapidKey = json.publicKey;
                                if (vapidKey) {
                                    const toUint8 = (base64String: string) => {
                                        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
                                        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
                                        const rawData = atob(base64);
                                        const outputArray = new Uint8Array(rawData.length);
                                        for (let i = 0; i < rawData.length; ++i) {
                                            outputArray[i] = rawData.charCodeAt(i);
                                        }
                                        return outputArray;
                                    };

                                    const sub = await reg.pushManager.getSubscription();
                                    if (!sub) {
                                        const newSub = await reg.pushManager.subscribe({
                                            userVisibleOnly: true,
                                            applicationServerKey: toUint8(vapidKey),
                                        });
                                        await fetch('/api/push/subscribe', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(newSub),
                                        });
                                    }
                                }
                            } catch {
                                // ignore push subscription errors
                            }
                        }
                    } catch {
                        // ignore sw registration errors
                    }
                })();
            }
            if (typeof Notification !== "undefined") {
                if (Notification.permission === "default") {
                    Notification.requestPermission().then((p) => setPermission(p));
                } else {
                    setPermission(Notification.permission);
                }
            }
            scheduleNext();
        } else {
            // Unsubscribe from push and inform server
            if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
                (async () => {
                    try {
                        const reg = await navigator.serviceWorker.getRegistration('/sw.js');
                        if (reg && reg.pushManager) {
                            const sub = await reg.pushManager.getSubscription();
                            if (sub) {
                                const endpoint = (sub as PushSubscription).endpoint;
                                await fetch('/api/push/unsubscribe', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ endpoint }),
                                });
                                await sub.unsubscribe();
                            }
                        }
                    } catch {
                        // ignore
                    }
                })();
            }
            clearTimer();
        }

        return () => clearTimer();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [time, enabled]);

    function clearTimer() {
        if (timerRef.current !== null) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }

    function scheduleNext() {
        clearTimer();
        if (!enabled) return;
        if (typeof window === "undefined") return;
        if (typeof Notification === "undefined" || Notification.permission === "denied") return;

        const [hhStr, mmStr] = time.split(":");
        const hh = Number(hhStr ?? 0);
        const mm = Number(mmStr ?? 0);
        const now = new Date();
        const next = new Date(now);
        next.setHours(hh, mm, 0, 0);
        if (next <= now) next.setDate(next.getDate() + 1);
        const ms = next.getTime() - now.getTime();

        const timeout = Math.max(0, ms);
        timerRef.current = window.setTimeout(() => {
            showNotification();
            scheduleNext();
        }, timeout) as unknown as number;
    }

    function showNotification() {
        if (typeof Notification === "undefined") return;
        if (Notification.permission !== "granted") return;

        notify({
            message: `It's ${time}. Time to do your laundry.`,
            type: "info",
            icon: AlarmClock,
            duration: 4000,
        })

        try {
            const title = "Laundry Reminder";
            const body = `It's ${time}. Time to do your laundry.`;
            new Notification(title, { body, tag: "laundry-reminder" });

            try {
                const audio = new Audio("/notification.wav");
                void audio.play();
            } catch {
                // ignore audio errors
            }
        } catch {
            // ignore notification errors
        }
    }

    function handleTest() {
        if (typeof Notification !== "undefined" && Notification.permission === "default") {
            Notification.requestPermission().then((p) => {
                setPermission(p);
                if (p === "granted") showNotification();
            });
        } else {
            showNotification();
        }
    }

    function handleToggle(checked: boolean) {
        try {
            localStorage.setItem(STORAGE_ENABLED_KEY, String(checked));
            setEnabled(checked);
        } catch {
            // ignore storage errors
        }
    }

    function getNextOccurrenceString() {
        if (!enabled) return "—";
        if (typeof window === "undefined") return "—";
        const [hhStr, mmStr] = time.split(":");
        const hh = Number(hhStr ?? 0);
        const mm = Number(mmStr ?? 0);
        const now = new Date();
        const next = new Date(now);
        next.setHours(hh, mm, 0, 0);
        if (next <= now) next.setDate(next.getDate() + 1);
        return next.toLocaleString();
    }

    return (
        <div className="max-w-md w-full bg-white/15 border border-white/10 rounded-lg p-4 shadow-sm">
            <div className="flex gap-4">
                <div className="flex-none w-12 h-12 rounded-md bg-white/30 flex items-center justify-center">
                    <AlarmClock className="w-5 h-5 text-amber-500" />
                </div>

                <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-white text-sm font-semibold">Laundry Reminder</h3>
                            <p className="text-xs text-gray-300 mt-1">Get a daily reminder to do laundry</p>
                        </div>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={enabled}
                                onChange={(e) => handleToggle(e.target.checked)}
                                className="w-4 h-4 rounded text-indigo-600 bg-gray-800"
                            />
                            <span className="text-xs text-gray-200">Enabled</span>
                        </label>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-transparent border border-white/20 rounded px-3 py-2">
                            <span className="text-xs text-gray-200">Time</span>
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="ml-2 bg-transparent outline-none text-white text-sm"
                            />
                        </div>

                        <button
                            onClick={handleTest}
                            className="ml-auto inline-flex items-center gap-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded"
                        >
                            Test
                        </button>
                    </div>

                    <div className="mt-3 text-xs text-gray-300 space-y-1">
                        <div>
                            <strong className="text-gray-100">Permission:</strong>
                            <span className="ml-2">{permission}</span>
                        </div>
                        <div>
                            <strong className="text-gray-100">Next:</strong>
                            <span className="ml-2">{getNextOccurrenceString()}</span>
                        </div>
                    </div>

                    <p className="mt-3 text-xs text-gray-300">
                        Note: browser notifications require permission and will show while this page is open.
                    </p>
                </div>
            </div>
        </div>
    );
}
