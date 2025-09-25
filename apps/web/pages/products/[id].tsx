import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Button,
  Divider,
  Chip,
  Rating,
  Skeleton,
  Breadcrumbs,
  Link as MuiLink,
  Alert,
} from '@mui/material';
import { GET_PRODUCT } from '../../lib/queries';
import { PRODUCT_FRAGMENT } from '@marketmesh/graphql';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../lib/utils';
import { NextSeo } from 'next-seo';

const ProductDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { addToCart, isInCart } = useCart();
  
  const { data, loading, error } = useQuery(GET_PRODUCT, {
    variables: { id },
    skip: !id,
  });

  const product = data?.product;
  const isProductInCart = isInCart(id as string);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
        quantity: 1,
        maxQuantity: product.stock,
      });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" height={60} width="80%" />
            <Skeleton variant="text" height={40} width="40%" />
            <Skeleton variant="text" height={100} />
            <Skeleton variant="rectangular" height={50} width={200} sx={{ mt: 2 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Error loading product: {error.message}
        </Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Product not found</Alert>
      </Container>
    );
  }

  return (
    <>
      <NextSeo
        title={`${product.name} | MarketMesh`}
        description={product.description || `Buy ${product.name} on MarketMesh`}
        openGraph={{
          title: product.name,
          description: product.description,
          images: product.images?.length ? [
            {
              url: product.images[0],
              width: 800,
              height: 600,
              alt: product.name,
            },
          ] : [],
        }}
      />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <MuiLink color="inherit" href="/">
            Home
          </MuiLink>
          <MuiLink color="inherit" href="/products">
            Products
          </MuiLink>
          <Typography color="text.primary">{product.name}</Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          {/* Product Images */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              {product.images?.length ? (
                <Box
                  component="img"
                  src={product.images[0]}
                  alt={product.name}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 400,
                    objectFit: 'contain',
                    mx: 'auto',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: 400,
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.secondary',
                  }}
                >
                  No image available
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Product Details */}
          <Grid item xs={12} md={6}>
            <Box mb={2}>
              <Typography variant="h4" component="h1" gutterBottom>
                {product.name}
              </Typography>
              
              <Box display="flex" alignItems="center" mb={2}>
                <Rating
                  value={product.rating?.average || 0}
                  precision={0.5}
                  readOnly
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  ({product.rating?.count || 0} reviews)
                </Typography>
              </Box>
              
              <Typography variant="h5" color="primary" mb={3}>
                {formatCurrency(product.price)}
                {product.originalPrice > product.price && (
                  <Typography
                    component="span"
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      textDecoration: 'line-through',
                      ml: 1,
                      display: 'inline-block',
                    }}
                  >
                    {formatCurrency(product.originalPrice)}
                  </Typography>
                )}
              </Typography>
              
              {product.stock > 0 ? (
                <Chip
                  label="In Stock"
                  color="success"
                  size="small"
                  sx={{ mb: 2 }}
                />
              ) : (
                <Chip
                  label="Out of Stock"
                  color="error"
                  size="small"
                  sx={{ mb: 2 }}
                />
              )}
              
              <Typography variant="body1" paragraph>
                {product.description}
              </Typography>
              
              <Box mt={3}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0 || isProductInCart}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  {isProductInCart ? 'Added to Cart' : 'Add to Cart'}
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  disabled={product.stock <= 0}
                >
                  Buy Now
                </Button>
              </Box>
              
              <Box mt={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Sold by: {product.seller?.businessName || 'MarketMesh Seller'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Free shipping on orders over $50
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  30-day easy returns
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        {/* Product Tabs */}
        <Box mt={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Product Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              {product.details?.map((detail: any, index: number) => (
                <Grid item xs={6} sm={4} key={index}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {detail.key}:
                  </Typography>
                  <Typography variant="body1">{detail.value}</Typography>
                </Grid>
              ))}
            </Grid>
            
            {product.description && (
              <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" whiteSpace="pre-line">
                  {product.description}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
        
        {/* Reviews Section */}
        {product.reviews?.length > 0 && (
          <Box mt={6}>
            <Typography variant="h6" gutterBottom>
              Customer Reviews
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              {product.reviews.map((review: any) => (
                <Grid item xs={12} key={review.id}>
                  <Paper sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {review.user.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Rating value={review.rating} readOnly size="small" />
                    {review.title && (
                      <Typography variant="subtitle2" mt={1}>
                        {review.title}
                      </Typography>
                    )}
                    <Typography variant="body2" mt={1}>
                      {review.comment}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </>
  );
};

export default ProductDetailPage;
