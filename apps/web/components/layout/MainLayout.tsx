import { Box, Container, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { useAuth } from '../../../contexts/AuthContext';

interface MainLayoutProps {
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  disableHeader?: boolean;
  disableFooter?: boolean;
}

const MainLayout = ({
  children,
  maxWidth = 'lg',
  disableHeader = false,
  disableFooter = false,
}: MainLayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
      }}
    >
      {!disableHeader && (
        <Header onMenuClick={handleDrawerToggle} isMobile={isMobile} />
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          ...(isAuthenticated && !isMobile && { ml: '240px' }),
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {!disableHeader && <Toolbar />}
        <Container
          maxWidth={maxWidth}
          sx={{
            flexGrow: 1,
            py: 4,
            width: '100%',
          }}
        >
          {children}
        </Container>
        {!disableFooter && <Footer />}
      </Box>

      {isAuthenticated && (
        <Sidebar
          mobileOpen={mobileOpen}
          onClose={handleDrawerToggle}
          isMobile={isMobile}
        />
      )}
    </Box>
  );
};

export default MainLayout;
