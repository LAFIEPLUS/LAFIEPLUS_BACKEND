import HealthArticle from "../models/HealthArticle.js"
import asyncHandler from "../utils/asyncHandler.js"
import { sendError, sendSuccess } from "../utils/apiResponse.js"


const slugify = (text) =>
    text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");


// @desc   Create article
// @route  POST /api/library/articles
// @access Admin
export const createArticle = asyncHandler(async (req, res) => {
    const { title, body, summary, category, locale = "en", tags, status = "draft" } = req.body;

    let slug = slugify(title);
    const existing = await HealthArticle.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const article = await HealthArticle.create({
        title, body, summary, category, locale, tags, status, slug,
        authorId: req.user._id,
    });

    sendSuccess(res, 201, "Article created", { article });
});

// @desc   List articles (with filtering and text search)
// @route  GET /api/library/articles
// @access Public
export const getArticles = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };
    filter.status = req.user?.role === "admin" && req.query.status ? req.query.status : "published";

    if (req.query.category) filter.category = req.query.category;
    if (req.query.locale) filter.locale = req.query.locale;
    if (req.query.tag) filter.tags = req.query.tag;
    if (req.query.search) filter.$text = { $search: req.query.search };

    const sortOpts = req.query.search ? { score: { $meta: "textScore" } } : { publishedAt: -1 };
    const projection = req.query.search ? { score: { $meta: "textScore" } } : {};

    const [articles, total] = await Promise.all([
        HealthArticle.find(filter, projection)
            .populate("authorId", "name")
            .skip(skip).limit(limit).sort(sortOpts)
            .select("-body"),
        HealthArticle.countDocuments(filter),
    ]);

    sendSuccess(res, 200, "Articles fetched", {
        articles,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
});

// @desc   Get single article by ID or slug
// @route  GET /api/library/articles/:id
// @access Public
export const getArticle = asyncHandler(async (req, res) => {
    const query = /^[a-f\d]{24}$/i.test(req.params.id)
        ? { _id: req.params.id }
        : { slug: req.params.id };

    const article = await HealthArticle.findOne({ ...query, isDeleted: false })
        .populate("authorId", "name");

    if (!article) return sendError(res, 404, "Article not found");
    if (article.status !== "published" && req.user?.role !== "admin") {
        return sendError(res, 404, "Article not found");
    }

    // Increment view count (fire and forget)
    HealthArticle.findByIdAndUpdate(article._id, { $inc: { viewCount: 1 } }).exec();

    sendSuccess(res, 200, "Article fetched", { article });
});

// @desc   Get article categories
// @route  GET /api/library/categories
// @access Public
export const getCategories = asyncHandler(async (_req, res) => {
    sendSuccess(res, 200, "Categories fetched", {
        categories: [
            { key: "maternal", label: "Maternal health", description: "Pregnancy, postnatal care, and family planning" },
            { key: "pedeatric", label: "Kids & Adolescent health", description: "Health guidance for young people" },
            { key: "preventive", label: "Preventive care", description: "Vaccinations, screenings, and healthy habits" },
            { key: "general", label: "General health", description: "Common illnesses, first aid, and wellness" },
        ],
    });
});


// @desc   Update article
// @route  PUT /api/library/articles/:id
// @access Admin
export const updateArticle = asyncHandler(async (req, res) => {
    const article = await HealthArticle.findOne({ _id: req.params.id, isDeleted: false });
    if (!article) return sendError(res, 404, "Article not found");

    const allowed = ["title", "body", "summary", "category", "locale", "tags", "status", "coverImage"];

    allowed.forEach((f) => { if (req.body[f] !== undefined) article[f] = req.body[f]; });
    
    await article.save();

    sendSuccess(res, 200, "Article updated", { article });
});

// @desc   Soft-delete article
// @route  DELETE /api/library/articles/:id
// @access Admin
export const deleteArticle = asyncHandler(async (req, res) => {
    const article = await HealthArticle.findById(req.params.id);
    if (!article) return sendError(res, 404, "Article not found");

    article.isDeleted = true;
    article.status = "archived";
    await article.save();

    sendSuccess(res, 200, "Article removed");
});