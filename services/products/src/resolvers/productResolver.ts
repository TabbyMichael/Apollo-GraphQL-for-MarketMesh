const products = [
  { id: '1', name: 'Laptop', price: 1200, seller: { id: '1', name: 'ElectronicsCorp' } },
  { id: '2', name: 'Keyboard', price: 75, seller: { id: '1', name: 'ElectronicsCorp' } },
  { id: '3', name: 'Mouse', price: 25, seller: { id: '1', name: 'ElectronicsCorp' } },
];

export const productResolver = {
  Query: {
    products: () => products,
  },
  Product: {
    __resolveReference(product: { id: string; }) {
      return products.find(p => p.id === product.id);
    },
    seller(product: { seller: { id: string; }; }) {
        return { __typename: "Seller", id: product.seller.id };
    }
  }
};