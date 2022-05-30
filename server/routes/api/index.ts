// Bismillaahirrahmaanirrahiim

import cors from "cors";
import api from "./api";
import details from "./details";

var express = require("express");
var router = express.Router();

router.use(cors());

router.get("/", api);
router.get("/details", details);

export default router;
