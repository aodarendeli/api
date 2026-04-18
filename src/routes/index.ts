import { Router } from 'express';
import categoryRoutes from '../modules/category/category.routes';
import productRoutes from '../modules/product/product.routes';
import healthRoutes from '../modules/health/health.routes';

const router: Router = Router();

router.use('/health', healthRoutes);
router.use('/api/categories', categoryRoutes);
router.use('/api/products', productRoutes);

export default router;
