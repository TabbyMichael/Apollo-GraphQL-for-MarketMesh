import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  InputBase,
  Badge,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Button,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../hooks/useCart';
import Link from 'next/link';

interface HeaderProps {
  onMenuClick: () => void;
  isMobile: boolean;
}

const Header = ({ onMenuClick, isMobile }: HeaderProps) => {
  const theme = useTheme();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const menuId = 'primary-search-account-menu';
  const isMenuOpen = Boolean(anchorEl);

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      {isAuthenticated ? (
        [
          <MenuItem key="profile" onClick={() => router.push('/profile')}>
            My Profile
          </MenuItem>,
          <MenuItem key="orders" onClick={() => router.push('/orders')}>
            My Orders
          </MenuItem>,
          <MenuItem key="wishlist" onClick={() => router.push('/wishlist')}>
            Wishlist
          </MenuItem>,
          <MenuItem key="settings" onClick={() => router.push('/settings')}>
            Settings
          </MenuItem>,
          <MenuItem key="divider" divider />,
          <MenuItem key="logout" onClick={handleLogout}>
            Logout
          </MenuItem>,
        ]
      ) : (
        [
          <MenuItem key="login" onClick={() => router.push('/login')}>
            Login
          </MenuItem>,
          <MenuItem key="signup" onClick={() => router.push('/signup')}>
            Sign Up
          </MenuItem>,
        ]
      )}
    </Menu>
  );

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        boxShadow: '0 2px 10px 0 rgba(0,0,0,0.08)',
      }}
    >
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { xs: 'block', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Link href="/" passHref>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              display: { xs: 'none', sm: 'block' },
              fontWeight: 700,
              letterSpacing: 1,
              cursor: 'pointer',
            }}
          >
            MarketMesh
          </Typography>
        </Link>

        <Box sx={{ flexGrow: 1 }} />

        {/* Search Bar */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{
            position: 'relative',
            borderRadius: theme.shape.borderRadius,
            backgroundColor: alpha(theme.palette.common.white, 0.15),
            '&:hover': {
              backgroundColor: alpha(theme.palette.common.white, 0.25),
            },
            marginRight: theme.spacing(2),
            marginLeft: 0,
            width: '100%',
            [theme.breakpoints.up('sm')]: {
              marginLeft: theme.spacing(3),
              width: 'auto',
              maxWidth: 400,
            },
          }}
        >
          <Box
            sx={{
              padding: theme.spacing(0, 2),
              height: '100%',
              position: 'absolute',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SearchIcon />
          </Box>
          <InputBase
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              color: 'inherit',
              '& .MuiInputBase-input': {
                padding: theme.spacing(1, 1, 1, 0),
                paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                transition: theme.transitions.create('width'),
                width: '100%',
                [theme.breakpoints.up('md')]: {
                  width: '20ch',
                  '&:focus': {
                    width: '30ch',
                  },
                },
              },
            }}
          />
        </Box>

        {/* Icons */}
        <Box sx={{ display: 'flex' }}>
          <IconButton
            size="large"
            aria-label="show wishlist"
            color="inherit"
            onClick={() => router.push('/wishlist')}
          >
            <Badge badgeContent={0} color="error">
              <FavoriteBorderIcon />
            </Badge>
          </IconButton>
          
          <IconButton
            size="large"
            aria-label={`show ${itemCount} items in cart`}
            color="inherit"
            onClick={() => router.push('/cart')}
          >
            <Badge badgeContent={itemCount} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
          
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls={menuId}
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            {user ? (
              <Avatar
                alt={user.firstName}
                src={user.avatar}
                sx={{ width: 32, height: 32 }}
              >
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </Avatar>
            ) : (
              <PersonIcon />
            )}
          </IconButton>
        </Box>
      </Toolbar>
      {renderMenu}
    </AppBar>
  );
};

export default Header;
