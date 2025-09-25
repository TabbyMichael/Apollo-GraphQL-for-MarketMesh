import { useGetProductsQuery } from '@marketmesh/graphql/src/generated/graphql';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';

const ProductsPage = () => {
  const { data, loading, error } = useGetProductsQuery();

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">Error loading products: {error.message}</Alert>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Products
      </Typography>
      <List>
        {data?.products.map((product) => (
          <ListItem key={product.id}>
            <ListItemText
              primary={product.name}
              secondary={`$${product.price}`}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default ProductsPage;