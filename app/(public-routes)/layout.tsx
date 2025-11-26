import { BubbleBackground } from "@/components/animate-ui/components/backgrounds/bubble";
import Providers from "../components/provider/Providers";

export default function PublicRoutesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <div className="relative overflow-hidden container mx-auto max-w-md flex flex-col self-center items-center justify-center h-screen text-white p-8">
            <BubbleBackground className="absolute top-0 left-0 -z-10 w-full h-full" />
            <Providers>{children}</Providers>
        </div>
  );
}