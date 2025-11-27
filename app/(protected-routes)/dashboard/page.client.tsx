"use client";

import { PageHeader } from "../components/ui/PageHeader";
import { IconDashboard } from "@tabler/icons-react";

export default function DashboardClient() {
    return (
        <div className="flex-1 flex flex-col gap-6 p-4 w-full max-w-md mx-auto select-none h-full">
            <PageHeader title="Dashboard" description="Overview of your account" icon={IconDashboard} />
        </div>
    );
}