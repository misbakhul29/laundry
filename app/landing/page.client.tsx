"use client";

export default function LandingPageClient() {
    return (
        <div className="flex flex-col gap-4">
            <h1>Welcome to the Landing Page</h1>
            <p>
                This is the landing page. You can navigate to the login page by clicking the link below.
            </p>
            <a href="/auth" className="text-blue-500">
                Login
            </a>
        </div>
    );
}