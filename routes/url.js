const express = require("express");
const router = express.Router();
require("dotenv").config();
const { nanoid } = require("nanoid");

const Url = require("../models/urlModel");
const base = process.env.base_url;

/**
 * @swagger
 * components:
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
 */



router.post("/short", async (req, res) => {
  try {
    const { url } = req.body;
    const urlId = nanoid(7);
    //if already exist
    const findUrl = await Url.findOne({ originalUrl: url });
    if (findUrl) {
      return res
        .status(200)
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
        .status(200)
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
    res.status(500).json({ message: `Server Error + ${error}` });
  }
});

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
      return res.redirect(url.originalUrl);
    } else res.status(404).json({ message: "Url Not found" });
  } catch (error) {
    res.status(500).json({ message: `Server Error + ${error}` });
  }
});

module.exports = router;
