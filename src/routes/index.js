const { Router } = require('express')
const activityRoute = require('./activities/index');
const categoryRoute = require('./category/index');
const coordinatorRoute = require('./coordinator/index');
const groupRoute = require('./group/index');
const uploadRoute = require('./uploads/index');
const userRoute = require('./user/index');
const { Db } = require('../config/db');
const sharp = require('sharp');

const router = Router()

router.use("/category", categoryRoute)
router.use('/activity', activityRoute);
router.use('/coordinator', coordinatorRoute);
router.use('/group', groupRoute);
router.use('/uploads', uploadRoute);
router.use('/user', userRoute);

router.get("/country", async(req, res) => {
    try {
        const [country] = await Db.promise().query('SELECT * FROM tbl_country')
        if(country.length > 0) {
            res.status(404).json({
                country
            })
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

router.get("/user_roles", async(req, res) => {
    try {
        const [roles] = await Db.promise().query('SELECT * FROM tbl_user_roles')
        if(roles) {
            res.status(200).json({
                roles
            })
        } else {
            res.status(400).json({
                message : "Roles not found"
            })
        }
    } catch (error) {
        res.status(404).json({
            message : "can't fetch category"
        })
    } 
})

router.get("/activity_category", async(req, res) => {
    try {
        const [activity_category] = await Db.promise().query('SELECT activity_category_id, activity_category FROM tbl_green_activity_category')
        if(activity_category) {
            res.status(200).json({
                activity_category
            })
        } else {
            res.status(400).json({
                message : "activity category not found"
            })
        }
    } catch (error) {
        res.status(404).json({
            message : "can't fetch activity category"
        })
    } 
})

router.get("/activity_sub_category", async(req, res) => {
    try {
        const [activity_sub_category] = await Db.promise().query('SELECT * FROM tbl_activity_sub_category')
        if(activity_sub_category) {
            res.status(200).json({
                activity_sub_category
            })
        } else {
            res.status(400).json({
                message : "activity sub category not found"
            })
        }
    } catch (error) {
        res.status(404).json({
            message : "can't fetch activity sub category"
        })
    } 
})

router.get("/clubs", async(req, res) => {
    try {
        const [clubs] = await Db.promise().query('SELECT * FROM tbl_clubs')
        if(clubs) {
            res.status(200).json({
                clubs
            })
        } else {
            res.status(400).json({
                message : "clubs not found"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(404).json({
            message : "can't fetch clubs"
        })
    } 
})

router.get("/logout", async(req, res) => {
    res.clearCookie('token')
    res.status(200).json({
        message : " User logout"
    }) 
})

module.exports = router;