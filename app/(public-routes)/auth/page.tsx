import dynamic from 'next/dynamic';

const AuthPage = dynamic(() => import('./page.client'), { ssr: true });

const Auth = () => {
  return <AuthPage />;
}

export default Auth;