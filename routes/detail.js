const express                = require('express')
const router                 = express.Router()

const detailController             = require('../controllers/detailController')

router.get("/check-file",                                               detailController.checkfile)

router.get("/overview/:datacode/:dataindex",                            detailController.overview);
router.get("/detailview/:secindex/:sitecode/:sectioncode/:prefix/:dataindex",     detailController.detailview);


module.exports = router
