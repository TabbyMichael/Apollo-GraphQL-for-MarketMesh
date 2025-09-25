import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Drawer,
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  useTheme,
  useMediaQuery,
  Avatar,
  Button,
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  FavoriteBorder as FavoriteIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Store as StoreIcon,
  Receipt as ReceiptIcon,
  Logout as LogoutIcon,
  Category as CategoryIcon,
  LocalOffer as TagIcon,
  People as PeopleIcon,
  Assessment as AnalyticsIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';

const drawerWidth = 240;

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

const Sidebar = ({ mobileOpen, onClose, isMobile }: SidebarProps) => {
  const theme = useTheme();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState({
    products: false,
    orders: false,
    customers: false,
    marketing: false,
  });

  const handleClick = (key: keyof typeof open) => {
    setOpen({ ...open, [key]: !open[key] });
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      onClose();
    }
  };

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      adminOnly: false,
    },
    {
      text: 'Products',
      icon: <CategoryIcon />,
      path: '/products',
      children: [
        { text: 'All Products', path: '/products' },
        { text: 'Categories', path: '/categories' },
        { text: 'Inventory', path: '/inventory' },
      ],
      adminOnly: true,
    },
    {
      text: 'Orders',
      icon: <ShoppingCartIcon />,
      path: '/orders',
      children: [
        { text: 'All Orders', path: '/orders' },
        { text: 'Returns', path: '/returns' },
      ],
      adminOnly: false,
    },
    {
      text: 'Customers',
      icon: <PeopleIcon />,
      path: '/customers',
      adminOnly: true,
    },
    {
      text: 'Analytics',
      icon: <AnalyticsIcon />,
      path: '/analytics',
      adminOnly: true,
    },
    {
      text: 'Marketing',
      icon: <TagIcon />,
      path: '/marketing',
      children: [
        { text: 'Discounts', path: '/discounts' },
        { text: 'Campaigns', path: '/campaigns' },
      ],
      adminOnly: true,
    },
  ];

  const userMenu = [
    { text: 'My Profile', icon: <PersonIcon />, path: '/profile' },
    { text: 'My Orders', icon: <ReceiptIcon />, path: '/my-orders' },
    { text: 'Wishlist', icon: <FavoriteIcon />, path: '/wishlist' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* User Profile */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Avatar
          sx={{
            width: 64,
            height: 64,
            mb: 1,
            bgcolor: theme.palette.primary.main,
          }}
          src={user?.avatar}
        >
          {user?.firstName?.[0]}
          {user?.lastName?.[0]}
        </Avatar>
        <Typography variant="subtitle1" fontWeight="medium">
          {user?.firstName} {user?.lastName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.email}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          sx={{ mt: 1 }}
          onClick={() => handleNavigation('/profile')}
        >
          View Profile
        </Button>
      </Box>

      {/* Navigation */}
      <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
        <List>
          {menuItems.map((item) => {
            if (item.adminOnly && user?.role !== 'ADMIN') return null;
            
            if (item.children) {
              return (
                <div key={item.text}>
                  <ListItemButton onClick={() => handleClick(item.text.toLowerCase() as keyof typeof open)}>
                    <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                    {open[item.text.toLowerCase() as keyof typeof open] ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  <Collapse in={open[item.text.toLowerCase() as keyof typeof open]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.children.map((child) => (
                        <ListItemButton
                          key={child.text}
                          sx={{ pl: 4 }}
                          onClick={() => handleNavigation(child.path)}
                          selected={isActive(child.path)}
                        >
                          <ListItemText primary={child.text} />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </div>
              );
            }
            
            return (
              <ListItem
                key={item.text}
                disablePadding
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemButton selected={isActive(item.path)}>
                  <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Bottom Section */}
      <Box sx={{ borderTop: `1px solid ${theme.palette.divider}`, p: 2 }}>
        <List>
          {userMenu.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={() => handleNavigation(item.path)}>
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
          <ListItem disablePadding>
            <ListItemButton onClick={logout}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { md: drawerWidth },
        flexShrink: { md: 0 },
      }}
      aria-label="mailbox folders"
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: 'none',
            boxShadow: theme.shadows[8],
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: 'none',
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[1],
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
