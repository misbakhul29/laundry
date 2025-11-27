'use client';

import { PageHeader } from '../components/ui/PageHeader';
import { IconUser } from '@tabler/icons-react';

export default function ProfilesClientPage() {
    return (
        <div className="flex-1 flex flex-col gap-6 p-4 w-full max-w-md mx-auto select-none h-full">
            <PageHeader title="Profiles" description="Manage your profiles" icon={IconUser} />
        </div>
    );
}