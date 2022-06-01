// Bismillaahirrahmaanirrahiim

import cors from "cors";
import api from "./api";
import details from "./details";
import history from "./history";

var express = require("express");
var router = express.Router();

router.use(cors());

router.get("/", api);
router.get("/details", details);
router.get("/history", history);

export default router;
