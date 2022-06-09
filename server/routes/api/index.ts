// Bismillaahirrahmaanirrahiim

import cors from "cors";
import api from "./api";
import details from "./details";
import history from "./history";
import starred from "./starred";

var express = require("express");
var router = express.Router();

router.use(cors());

router.post("/", api);
router.get("/details", details);
router.get("/history", history);
router.post("/starred", starred);

export default router;
