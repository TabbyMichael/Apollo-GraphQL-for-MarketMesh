import { Box, Container, Grid, Link, Typography, Divider, useTheme } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn, GitHub } from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Shop',
      links: [
        { label: 'All Products', href: '/products' },
        { label: 'Featured', href: '/featured' },
        { label: 'New Arrivals', href: '/new-arrivals' },
        { label: 'Sale', href: '/sale' },
      ],
    },
    {
      title: 'Customer Service',
      links: [
        { label: 'Contact Us', href: '/contact' },
        { label: 'FAQs', href: '/faqs' },
        { label: 'Shipping & Returns', href: '/shipping-returns' },
        { label: 'Size Guide', href: '/size-guide' },
      ],
    },
    {
      title: 'About Us',
      links: [
        { label: 'Our Story', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Blog', href: '/blog' },
        { label: 'Press', href: '/press' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms & Conditions', href: '/terms' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Cookie Policy', href: '/cookie-policy' },
        { label: 'Sitemap', href: '/sitemap' },
      ],
    },
  ];

  const socialLinks = [
    { icon: <Facebook />, label: 'Facebook', href: '#' },
    { icon: <Twitter />, label: 'Twitter', href: '#' },
    { icon: <Instagram />, label: 'Instagram', href: '#' },
    { icon: <LinkedIn />, label: 'LinkedIn', href: '#' },
    { icon: <GitHub />, label: 'GitHub', href: '#' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-evenly">
          {footerLinks.map((column) => (
            <Grid item xs={6} sm={3} key={column.title}>
              <Typography
                variant="subtitle1"
                color="text.primary"
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                {column.title}
              </Typography>
              <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: 'inline-block',
                        py: 0.5,
                        '&:hover': {
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary" align={{ xs: 'center', md: 'left' }}>
              © {currentYear} MarketMesh. All rights reserved.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: { xs: 'center', md: 'flex-end' },
                gap: 2,
              }}
            >
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  color="inherit"
                  aria-label={social.label}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: theme.palette.action.hover,
                    color: theme.palette.text.primary,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {social.icon}
                </Link>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Box mt={4}>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            MarketMesh is a modern e-commerce platform built with Next.js, Apollo GraphQL, and Material-UI.
          </Typography>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            This is a demo application. No real transactions will be processed.
          </Typography>
        </Box>

        <Box mt={2} textAlign="center">
          <Typography variant="caption" color="text.secondary">
            Version {process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
