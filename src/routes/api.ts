import { Router, Request, Response, NextFunction } from 'express';
import { BuildiumService } from '../services/buildium';

const router = Router();
const buildiumService = BuildiumService.getInstance();

router.get('/workorders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workOrders = await buildiumService.getWorkOrders();
    res.json(workOrders);
  } catch (error) {
    next(error);
  }
});

export const apiRoutes = router; 