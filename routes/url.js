const express = require("express");
const router = express.Router();
require("dotenv").config();
const { nanoid } = require("nanoid");

const Url = require("../models/urlModel");
const isAuthenticated = require("../middlewares/authJwt");
const base = process.env.base_url;

/**
 * @swagger
 * security:
 *   - bearerAuth: []
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Url:
 *        type: object
 *        required:
 *          - urlId
 *          - originalUrl
 *          - shortUrl
 *        properties:
 *          urlId:
 *            type: STRING
 *            description: Generated Nanoid of the url
 *          originalUrl:
 *            type: STRING
 *            description: Original url
 *          shortUrl:
 *            type: STRING
 *            description: short url
 *          clicks:
 *            type: INTEGER
 *            description: Number of times link clicked
 *          expiresAt:
 *            type: DATE
 *            description: Expiry time of link
 *          singleUse:
 *            type: BOOLEAN
 *            description: flag for single use links
 *        example:
 *          urlId: bB4H6-B
 *          originalUrl: https://github.com/RiteshKr00/
 *          shortUrl: http://localhost:8080/bB4H6-B
 *          clicks: 2
 *          expiresAt: ISODate("2023-01-07T06:31:13.891Z")
 *          singleUse: true
 *          createdBy: ObjectId("63b9089fe3185f0f5f922187")
 */

/**
 * @swagger
 * /api/v1/url/short:
 *   post:
 *     summary: Create a short Url without Login
 *     tags:
 *       - Url
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 description: Url to be shortened
 *           example:
 *            url: https://www.google.com/search?q=superman&rlz=1C1CHBD_enIN1032IN1032&oq=superman&aqs=chrome..69i57j46i39j0i131i433j0i433i512l2j46i433i512j0i433i512l2j46i433i512j0i271.2885j0j4&sourceid=chrome&ie=UTF-8
 *     responses:
 *        200:
 *          description: Short Url Created Successfully
 *        409:
 *          description: Url already Exist
 *        500:
 *          description: Server Error
 */

router.post("/short", async (req, res) => {
  try {
    const { url } = req.body;
    const urlId = nanoid(7);
    //if already exist
    const findUrl = await Url.findOne({ originalUrl: url });
    if (findUrl) {
      return res
        .status(409)
        .json({ message: "link already exist", url: findUrl });
    }
    const shortUrl = `${base}/${urlId}`;
    const newShortUrl = await new Url({
      urlId,
      originalUrl: url,
      shortUrl,
      expiresAt: Date.now() + 86400000, //24hrs
    }).save();

    res.status(200).json({ message: "success", url: shortUrl });
  } catch (error) {
    res.status(500).json({ message: `Server Error + ${error}` });
  }
});
/**
 * @swagger
 * /api/v1/url/singleUse:
 *   post:
 *     summary: Create a Onetime Use short Url without Login
 *     tags:
 *       - Url
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 description: Url to be shortened
 *           example:
 *            url: https://www.google.com/search?q=superman&oq=superman&aqs=chrome..69i57j46i39j0i131i433j0i433i512l2j46i433i512j0i433i512l2j46i433i512j0i271.2885j0j4&sourceid=chrome&ie=UTF-8
 *     responses:
 *        200:
 *          description: Short Url Created Successfully
 *        409:
 *          description: Url already Exist
 *        500:
 *          description: Server Error
 */
//create single use Url
router.post("/singleUse", async (req, res) => {
  try {
    const { url } = req.body;
    console.log(url);
    const urlId = nanoid(7);
    //if already exist
    const findUrl = await Url.findOne({ originalUrl: url });
    if (findUrl) {
      return res
        .status(409)
        .json({ message: "link already exist", url: findUrl });
    }
    const shortUrl = `${base}/${urlId}`;
    const newShortUrl = await new Url({
      urlId,
      originalUrl: url,
      shortUrl,
      expiresAt: Date.now() + 86400000, //24hrs
      singleUse: true,
    }).save();

    res.status(200).json({ message: "success", url: shortUrl });
  } catch (error) {
    res.status(500).json({ message: `Server Error + ${error.message}` });
  }
});

/**
 * @swagger
 * /api/v1/url/{urlId}:
 *   get:
 *     summary: Redirect short url to original url
 *     tags:
 *       - Url
 *     parameters:
 *       - in: path
 *         name: urlId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *        404:
 *          description: Url not found
 *        410:
 *          description: Url Expired
 *        500:
 *          description: Server Error
 */
router.get("/:urlId", async (req, res) => {
  try {
    console.log(req.params.urlId);
    const url = await Url.findOne({ urlId: req.params.urlId });
    console.log(url);
    if (url) {
      //check for expiry
      if (url.expiresAt <= Date.now())
        return res.status(410).json({ message: "Url expired" });
      if (url.singleUse) {
        console.log("true");
        //check single use
        await Url.updateOne(
          {
            urlId: req.params.urlId,
          },
          { expiresAt: Date.now() }
        );
      } else {
        await Url.updateOne(
          {
            urlId: req.params.urlId,
          },
          { $inc: { clicks: 1 } }
        );
      }
      return res.status(302).redirect(url.originalUrl);
    } else res.status(404).json({ message: "Url Not found" });
  } catch (error) {
    res.status(500).json({ message: `Server Error + ${error.message}` });
  }
});

//Authenticated routes
/**
 * @swagger
 * /api/v1/url/auth/short:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a short Url with authentication
 *     tags:
 *       - Url
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 description: Url to be shortened
 *           example:
 *            url: https://www.google.com/search?q=superman&rlz=1C1CHBD_enIN1032IN1032&oq=superman&aqs=chrome..69i57j46i39j0i131i433j0i433i512l2j46i433i512j0i433i512l2j46i433i512j0i271.2885j0j4&sourceid=chrome&ie=UTF-8
 *     responses:
 *        200:
 *          description: Short Url Created Successfully
 *        409:
 *          description: Url already Exist
 *        500:
 *          description: Server Error
 */

router.post("/auth/short", isAuthenticated, async (req, res) => {
  try {
    const { url } = req.body;
    const urlId = nanoid(7);
    //if already exist
    const findUrl = await Url.findOne({ originalUrl: url });
    if (findUrl) {
      return res
        .status(409)
        .json({ message: "link already exist", url: findUrl });
    }
    const shortUrl = `${base}/${urlId}`;
    const newShortUrl = await new Url({
      urlId,
      originalUrl: url,
      shortUrl,
      expiresAt: Date.now() + 86400000, //24hrs
      createdBy: req.user.id,
    }).save();

    res.status(200).json({ message: "success", url: shortUrl });
  } catch (error) {
    res.status(500).json({ message: `Server Error + ${error}` });
  }
});
//create single use Url
/**
 * @swagger
 * /api/v1/url/auth/singleUse:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a Onetime Use short Url with authentication
 *     tags:
 *       - Url
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 description: Url to be shortened
 *           example:
 *            url: https://www.google.com/search?q=superman&oq=superman&aqs=chrome..69i57j46i39j0i131i433j0i433i512l2j46i433i512j0i433i512l2j46i433i512j0i271.2885j0j4&sourceid=chrome&ie=UTF-8
 *     responses:
 *        200:
 *          description: Short Url Created Successfully
 *        409:
 *          description: Url already Exist
 *        500:
 *          description: Server Error
 */
router.post("/auth/singleUse", isAuthenticated, async (req, res) => {
  try {
    const { url } = req.body;
    console.log(url);
    const urlId = nanoid(7);
    //if already exist
    const findUrl = await Url.findOne({ originalUrl: url });
    if (findUrl) {
      return res
        .status(409)
        .json({ message: "link already exist", url: findUrl });
    }
    const shortUrl = `${base}/${urlId}`;
    const newShortUrl = await new Url({
      urlId,
      originalUrl: url,
      shortUrl,
      expiresAt: Date.now() + 86400000, //24hrs
      singleUse: true,
      createdBy: req.user.id,
    }).save();

    res.status(200).json({ message: "success", url: shortUrl });
  } catch (error) {
    res.status(500).json({ message: `Server Error + ${error.message}` });
  }
});

//getmyUrl
/**
 * @swagger
 * /api/v1/url/auth/myurl:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all my urls with Authentication
 *     tags:
 *       - Url
 *     responses:
 *        200:
 *          description: Short Url Created Successfully
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Url'
 *        500:
 *          description: Server Error
 */
router.get("/auth/myurl", isAuthenticated, async (req, res) => {
  try {
    const myUrl = await Url.find({ createdBy: req.user.id }).populate(
      "createdBy"
    );
    res.status(200).json({ message: "success", url: myUrl });
  } catch (error) {
    res.status(500).json({ message: `Server Error + ${error.message}` });
  }
});

module.exports = router;
