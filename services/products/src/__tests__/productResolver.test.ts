import resolvers from '../resolvers/productResolver';
import { ProductService } from '../productService';
import { UserRole } from '@prisma/client';
import { AuthenticationError, ForbiddenError } from 'apollo-server-errors';

// Mock the ProductService to isolate the resolver tests
jest.mock('../productService');

const mockProductService = new ProductService(null as any) as jest.Mocked<ProductService>;

// Define different user contexts for testing authorization
const mockSellerContext = {
  productService: mockProductService,
  userId: 'seller-123',
  userRole: 'SELLER' as UserRole,
};

const mockAdminContext = {
  productService: mockProductService,
  userId: 'admin-456',
  userRole: 'ADMIN' as UserRole,
};

const mockOtherUserContext = {
    productService: mockProductService,
    userId: 'other-user-789',
    userRole: 'CUSTOMER' as UserRole,
};

const mockUnauthenticatedContext = {
    productService: mockProductService,
    userId: null,
    userRole: null,
};

describe('Product Resolver', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockProduct = {
    id: 'product-abc',
    name: 'Test Product',
    sellerId: 'seller-123',
    // other fields omitted for brevity
  };

  describe('Query.products', () => {
    it('should call the service to get all products', async () => {
      mockProductService.products.mockResolvedValue([mockProduct as any]);
      await resolvers.Query.products({}, {}, mockSellerContext, {} as any);
      expect(mockProductService.products).toHaveBeenCalledTimes(1);
    });
  });

  describe('Query.product', () => {
    it('should call the service to get a single product', async () => {
      mockProductService.product.mockResolvedValue(mockProduct as any);
      await resolvers.Query.product({}, { id: 'product-abc' }, mockSellerContext, {} as any);
      expect(mockProductService.product).toHaveBeenCalledWith('product-abc');
    });
  });

  describe('Mutation.createProduct', () => {
    const input = { name: 'New Gadget', sellerId: 'seller-123', price: 100, stock: 10 };

    it('should create a product when authenticated', async () => {
      mockProductService.createProduct.mockResolvedValue(mockProduct as any);
      await resolvers.Mutation.createProduct({}, { input }, mockSellerContext, {} as any);
      expect(mockProductService.createProduct).toHaveBeenCalledWith(input, mockSellerContext.userId);
    });

    it('should throw an AuthenticationError if user is not logged in', () => {
        const action = () => resolvers.Mutation.createProduct({}, { input }, mockUnauthenticatedContext, {} as any);
        expect(action).toThrow(AuthenticationError);
    });
  });

  describe('Mutation.updateProduct', () => {
    const input = { name: 'Updated Gadget' };

    it('should update a product for the correct seller', async () => {
      mockProductService.updateProduct.mockResolvedValue(mockProduct as any);
      await resolvers.Mutation.updateProduct({}, { id: 'product-abc', input }, mockSellerContext, {} as any);
      expect(mockProductService.updateProduct).toHaveBeenCalledWith('product-abc', input, mockSellerContext.userId, mockSellerContext.userRole);
    });

    it('should update a product for an admin', async () => {
        mockProductService.updateProduct.mockResolvedValue(mockProduct as any);
        await resolvers.Mutation.updateProduct({}, { id: 'product-abc', input }, mockAdminContext, {} as any);
        expect(mockProductService.updateProduct).toHaveBeenCalledWith('product-abc', input, mockAdminContext.userId, mockAdminContext.userRole);
    });

    it('should call the service to update, and the service is responsible for authorization', async () => {
        await resolvers.Mutation.updateProduct({}, { id: 'product-abc', input }, mockOtherUserContext, {} as any);
        expect(mockProductService.updateProduct).toHaveBeenCalledWith('product-abc', input, mockOtherUserContext.userId, mockOtherUserContext.userRole);
    });
  });

  describe('Mutation.deleteProduct', () => {
    it('should delete a product for the correct seller', async () => {
      mockProductService.deleteProduct.mockResolvedValue(true);
      await resolvers.Mutation.deleteProduct({}, { id: 'product-abc' }, mockSellerContext, {} as any);
      expect(mockProductService.deleteProduct).toHaveBeenCalledWith('product-abc', mockSellerContext.userId, mockSellerContext.userRole);
    });

    it('should delete a product for an admin', async () => {
        mockProductService.deleteProduct.mockResolvedValue(true);
        await resolvers.Mutation.deleteProduct({}, { id: 'product-abc' }, mockAdminContext, {} as any);
        expect(mockProductService.deleteProduct).toHaveBeenCalledWith('product-abc', mockAdminContext.userId, mockAdminContext.userRole);
    });

    it('should call the service to delete, and the service is responsible for authorization', async () => {
        await resolvers.Mutation.deleteProduct({}, { id: 'product-abc' }, mockOtherUserContext, {} as any);
        expect(mockProductService.deleteProduct).toHaveBeenCalledWith('product-abc', mockOtherUserContext.userId, mockOtherUserContext.userRole);
    });
  });
});