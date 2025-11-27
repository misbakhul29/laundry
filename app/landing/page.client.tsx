"use client";
import { Loader } from "lucide-react";
import ButtonAction from "../components/ui/buttons/ButtonAction";
import LandingNavbar from "./components/LandingNavbar";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useNotification } from "../components/provider/NotificationProvider";
import { encryptToken } from "../actions/token";

export default function LandingPageClient() {
    const router = useRouter();
    const { notify } = useNotification();
    const [isLoading, setIsLoading] = useState(false);
    const handleLogin = async (role: "user" | "provider") => {
        try {
            setIsLoading(true);
            const token = await encryptToken(`role=${role}`);
            notify({ type: "success", message: "Redirecting to login..." });
            if (token) router.push(`/auth`);
            setIsLoading(false);
        } catch (err) {
            console.error(err);
            notify({ type: "error", message: "Failed to initiate login. Please try again." });
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col">
            <LandingNavbar />

            <main id="home" className="max-w-4xl mx-auto px-6 py-20 flex flex-col h-[80vh] justify-center items-center text-center gap-8">
                <div className="flex flex-col gap-1">
                    <h1 className="text-4xl md:text-5xl font-marker-hatch leading-snug">CleanSwipe</h1>
                    <h2 className="text-2xl font-bold text-gray-300">Your Real-Time Laundry Partner</h2>
                    <p className="text-lg text-gray-400 max-w-2xl">
                        Fast pickups, professional washing, and doorstep delivery. Choose your role and get started.
                    </p>
                </div>

                <div className="flex gap-4 mt-4">
                    <ButtonAction
                        onClick={() => handleLogin("user")}
                        className={`px-6 py-3 rounded-lg ${isLoading ? "cursor-not-allowed" : ""}`}
                        aria-label="Login as user"
                    >
                        {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : "Login as User"}
                    </ButtonAction>

                    <ButtonAction
                        onClick={() => handleLogin("provider")}
                        className="px-6 py-3 rounded-lg"
                        aria-label="Login as provider"
                    >
                        Login as Provider
                    </ButtonAction>
                </div>
            </main>

            <footer className="absolute bottom-0 left-0 right-0 font-mono text-center text-gray-400 text-xs py-4">
                &copy; {new Date().getFullYear()} CleanSwipe. All rights reserved.
            </footer>
        </div>
    );
}