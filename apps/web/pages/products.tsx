import { useQuery, gql } from '@apollo/client';
import { ProductFragment } from '@marketmesh/graphql/src/fragments/product';
import { GetProductsQuery } from '@marketmesh/graphql/src/generated/graphql';

const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      ...ProductFields
    }
  }
  ${ProductFragment}
`;

const ProductsPage = () => {
  const { loading, error, data } = useQuery<GetProductsQuery>(GET_PRODUCTS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>Products</h1>
      <ul>
        {data?.products.map((product) => (
          <li key={product.id}>
            {product.name} - ${product.price}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductsPage;