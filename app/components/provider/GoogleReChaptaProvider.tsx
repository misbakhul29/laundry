// app/layout.tsx atau parent component
import { ReactNode } from "react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export default function ChaptaProvider({ children }: { children: ReactNode }) {
    const reCaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
    if (!reCaptchaKey) {
        console.warn("NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set! Skipping reCAPTCHA.");
        return children;
    } else {
        console.info("reCAPTCHA site key found. Initializing reCAPTCHA.");
    }
    return (
        <GoogleReCaptchaProvider
            reCaptchaKey={reCaptchaKey}
            scriptProps={{
                async: false,
                defer: false,
                appendTo: "head",
                nonce: undefined,
            }}
        >
            {children}
        </GoogleReCaptchaProvider>
    );
}