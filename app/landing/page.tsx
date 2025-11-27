import LandingPageClient from "./page.client";
import LandingLayout from "./page.layout";

const LandingPage = () => {
  return (
    <LandingLayout>
        <LandingPageClient />
    </LandingLayout>
  );
};

export default LandingPage;