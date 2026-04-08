import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import ordersRouter from "./orders";
import storesRouter from "./stores";
import analyticsRouter from "./analytics";
import telegramRouter from "./telegram";
import usersRouter from "./users";
import reviewsRouter from "./reviews";
import bannersRouter from "./banners";
import flashSalesRouter from "./flash-sales";
import addressesRouter from "./addresses";
import notificationsRouter from "./notifications";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(categoriesRouter);
router.use(ordersRouter);
router.use(storesRouter);
router.use(analyticsRouter);
router.use(telegramRouter);
router.use(usersRouter);
router.use(reviewsRouter);
router.use(bannersRouter);
router.use(flashSalesRouter);
router.use(addressesRouter);
router.use(notificationsRouter);

export default router;
