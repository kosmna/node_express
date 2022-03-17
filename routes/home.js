const express                = require('express')
const router                 = express.Router()

const homeController             = require('../controllers/homeController')
const toolboxController             = require('../controllers/home/toolbox')

router.get("/",                             homeController.home)
router.get("/toolbox",                      toolboxController.isLoadedData, toolboxController.toolbox)
router.get("/toolBboxTips/:dataindex/:sitecode/:sectioncode", toolboxController.toolBoxTips)


module.exports = router
