import { ApolloProvider } from '@apollo/client';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { SnackbarProvider } from 'notistack';
import { useEffect, useState } from 'react';
import { CartProvider } from '../hooks/useCart';
import { AuthProvider } from '../contexts/AuthContext';
import { apolloClient } from '../lib/apollo';
import createEmotionCache from '../lib/createEmotionCache';
import theme from '../theme';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Fix for hydration mismatch errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle route changes for analytics or other side effects
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // You can add analytics or other side effects here
      console.log('App is changing to: ', url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  if (!mounted) {
    return null; // or a loading spinner
  }

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>MarketMesh - Modern E-commerce Platform</title>
        <meta name="description" content="MarketMesh - A modern e-commerce platform built with Next.js and GraphQL" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <ApolloProvider client={apolloClient}>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <SnackbarProvider
              maxSnack={3}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              autoHideDuration={4000}
            >
              <AuthProvider>
                <CartProvider>
                  <CssBaseline />
                  <Component {...pageProps} />
                </CartProvider>
              </AuthProvider>
            </SnackbarProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </ApolloProvider>
    </CacheProvider>
  );
}
