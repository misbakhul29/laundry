import AuthPage from './page.client';

export default async function Auth(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const keys = Object.keys(searchParams);
  
  const firstKey = keys[0];
  const firstValue = searchParams[firstKey];
  
  const token = (firstValue && firstValue !== '') 
    ? (Array.isArray(firstValue) ? firstValue[0] : firstValue) 
    : firstKey;

  return <AuthPage token={token || undefined} />;
}