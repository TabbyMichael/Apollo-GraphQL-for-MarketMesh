import { useQuery } from '@apollo/client';
import { PRODUCT_CARD_FRAGMENT } from '@marketmesh/graphql';
import { gql } from '@apollo/client';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useRouter } from 'next/router';

// Define the GraphQL query
const GET_PRODUCTS = gql`
  query GetProducts($page: Int, $limit: Int) {
    products(page: $page, limit: $limit) {
      ...ProductCardFields
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export default function Home() {
  const router = useRouter();
  const { loading, error, data, fetchMore } = useQuery(GET_PRODUCTS, {
    variables: { page: 1, limit: 10 },
    notifyOnNetworkStatusChange: true,
  });

  if (loading && !data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Error loading products: {error.message}
        </Alert>
      </Container>
    );
  }

  const products = data?.products || [];
  const hasMore = products.length % 10 === 0; // Simple pagination check

  const loadMore = () => {
    const currentLength = products.length;
    fetchMore({
      variables: {
        page: Math.ceil(currentLength / 10) + 1,
        limit: 10,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          products: [...prev.products, ...fetchMoreResult.products],
        };
      },
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Featured Products
      </Typography>
      
      <Grid container spacing={4}>
        {products.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6,
                },
              }}
              onClick={() => router.push(`/products/${product.id}`)}
            >
              <CardMedia
                component="img"
                height="140"
                image={`https://source.unsplash.com/random/300x200?product=${product.id}`}
                alt={product.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  ${product.price.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Sold by: {product.seller.fullName}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {hasMore && (
        <Box mt={4} display="flex" justifyContent="center">
          <Button
            variant="contained"
            onClick={loadMore}
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </Box>
      )}
    </Container>
  );
}
