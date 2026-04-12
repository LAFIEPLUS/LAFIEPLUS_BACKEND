import { Router } from "express";
import { 
    createArticle, 
    deleteArticle, 
    getArticle, 
    getArticles, 
    getCategories, 
    updateArticle 
} from "../controllers/libraryController.js";
import { authorize, optionalAuth, protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { articleSchema } from "../../validators/healthValidator.js";

const libraryRouter = Router();

libraryRouter.get("/library/categories", getCategories);
libraryRouter.get("/library/articles", optionalAuth, getArticles);
libraryRouter.get("/library/articles/:id", optionalAuth, getArticle);

libraryRouter.use(protect, authorize("admin"));
libraryRouter.post("/library/article", validate(articleSchema), createArticle);
libraryRouter.put("/library/articles/:id", updateArticle);
libraryRouter.delete("/library/article/:id", deleteArticle);

export default libraryRouter;