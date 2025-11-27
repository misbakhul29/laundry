import { ReactNode } from "react";
import Providers from "../components/provider/Providers";

const LandingLayout = ({ children }: { children: ReactNode }) => {
    return (
        <Providers>{children}</Providers>
    );
}
export default LandingLayout;