const { Router } = require('express')
const activityRoute = require('./activities/index');
const categoryRoute = require('./category/index');
const coordinatorRoute = require('./coordinator/index');
const groupRoute = require('./group/index');
const uploadRoute = require('./uploads/index');
const userRoute = require('./user/index');
const { Db } = require('../config/db');

const router = Router()

router.use("/category", categoryRoute)
router.use('/activity', activityRoute);
router.use('/coordinator', coordinatorRoute);
router.use('/group', groupRoute);
router.use('/upload', uploadRoute);
router.use('/user', userRoute);

router.get("/country", async(req, res) => {
    try {
        const [country] = await Db.promise().query('SELECT * FROM tbl_country')
        if(country.length > 0) {
            res.status(404).json({
                country
            })
            // Db.end()
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

router.get("/state", async(req, res) => {
    try {
        const [state] = await Db.promise().query('SELECT * FROM tbl_state')
        if(state.length > 0) {
            res.status(404).json({
                state
            })
            // Db.end()
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

router.get("/district", async(req, res) => {
    try {
        const [district] = await Db.promise().query('SELECT dis_id, dis_name FROM tbl_district')
        if(district.length > 0) {
            res.status(404).json({
                district
            })
            // Db.end()
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

router.get("/lsg/:id", async(req, res) => {
    const district_id = req.params.id;
    try {
        const [district] = await Db.promise().query('SELECT lsg_id, lsg_name FROM tbl_lsgd where lsg_dist_id=?',[district_id])
        if(district.length > 0) {
            res.status(404).json({
                district
            })
            // Db.end()
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