const { Router } = require('express')
const { Db } = require('../../config/db')
const router = Router()

router.get('/', async(req, res)=> {
    try {
        const [category] = await Db.promise().query('SELECT * FROM tbl_group_type')
        if(category.length != 0) {
            res.status(200).json({
                category,
                success : true
            })
        } else {
            res.status(204).json({
                message : "Category not found",
                success : false
            })
        }
    } catch (error) {
        res.status(500).json({
            message : "SQL Query Execution Failed | can't fetch category",
            success : false,
            error : error.message
        })
    } 
}) 

module.exports = router;