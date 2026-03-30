import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import ordersRouter from "./orders";
import storesRouter from "./stores";
import analyticsRouter from "./analytics";
import telegramRouter from "./telegram";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(categoriesRouter);
router.use(ordersRouter);
router.use(storesRouter);
router.use(analyticsRouter);
router.use(telegramRouter);

export default router;
