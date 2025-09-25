import { productResolver } from '../resolvers/productResolver';

describe('productResolver', () => {
  it('should return a list of products', () => {
    const products = productResolver.Query.products();
    expect(products).toHaveLength(3);
    expect(products[0].name).toBe('Laptop');
  });
});