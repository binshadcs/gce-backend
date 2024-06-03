const { Router } = require('express')
const { Db } = require('../../config/db')
const router = Router()

router.get('/', async(req, res)=> {
    try {
        const [category] = await Db.promise().query('SELECT * FROM tbl_group_type')
        if(category.length > 0) {
            res.status(404).json({
                category
            })
            Db.end()
        } else {
            res.status(200).json({
                message : "Category not found"
            })
        }
    } catch (error) {
        res.status(404).json({
            message : "can't fetch category"
        })
    } 
}) 

module.exports = router;