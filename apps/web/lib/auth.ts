import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { LOGIN, SIGNUP, GET_ME } from './queries';

export const TOKEN_KEY = 'marketmesh-token';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const login = async (
  client: ApolloClient<NormalizedCacheObject>,
  email: string,
  password: string
) => {
  const { data } = await client.mutate({
    mutation: LOGIN,
    variables: { email, password },
  });

  if (data?.login?.token) {
    setToken(data.login.token);
    return data.login.user;
  }
  
  throw new Error('Login failed');
};

export const signup = async (
  client: ApolloClient<NormalizedCacheObject>,
  input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }
) => {
  const { data } = await client.mutate({
    mutation: SIGNUP,
    variables: { input },
  });

  if (data?.signup?.token) {
    setToken(data.signup.token);
    return data.signup.user;
  }
  
  throw new Error('Signup failed');
};

export const logout = (client: ApolloClient<NormalizedCacheObject>): void => {
  removeToken();
  // Clear the Apollo cache
  client.resetStore();
};

export const getCurrentUser = async (client: ApolloClient<NormalizedCacheObject>) => {
  try {
    const { data } = await client.query({
      query: GET_ME,
      fetchPolicy: 'network-only', // Always fetch from the server
    });
    return data?.me || null;
  } catch (error) {
    // If there's an error (e.g., token expired), clear the token
    removeToken();
    return null;
  }
};

// Higher-order function to protect routes
export const withAuth = (WrappedComponent: React.ComponentType) => {
  const Wrapper = (props: any) => {
    const router = useRouter();
    const { data, loading } = useQuery(GET_ME);

    useEffect(() => {
      if (!loading && !data?.me) {
        router.push('/login');
      }
    }, [data, loading, router]);

    if (loading || !data?.me) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress />
        </Box>
      );
    }

    return <WrappedComponent {...props} user={data.me} />;
  };

  return Wrapper;
};
