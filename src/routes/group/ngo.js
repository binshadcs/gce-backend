const { Router } = require('express')
const { CreateNGO } = require('../../types')
const { Db } = require('../../config/db')
const router = Router()

router.get('/all', (req, res)=> {
    res.status(200).json({
        message : "group!! ngo"
    })
}) 

router.post('/register', async(req, res) => {
    const { groupId, members } = req.body;
    const result = CreateNGO.safeParse({ groupId, members })
    if(result.success) {
        try {
            const value = await Db.promise().query('SELECT gp_country_id, gp_state_id, dis_id, lsg_id, gp_city, gp_province FROM tbl_group_code WHERE gp_id = ?', [groupId])
            console.log(value[0][0].gp_country_id)
            try {
                const [{insertId}] = await Db.promise().query('INSERT INTO tbl_ngo (group_id, no_of_members, country_id, state_id, district_id, lsgd_id, city, province) VALUES(?,?,?,?,?,?, ?, ?)', [groupId, members, value[0][0].gp_country_id, value[0][0].gp_state_id, value[0][0].dis_id, value[0][0].lsg_id], value[0][0].gp_city, value[0][0].gp_province)
                
                res.status(200).json({
                    NgoId : insertId,
                    success : true
                })
            } catch (error) {
                res.status(500).json({
                    message : "SQL Query Execution Failed | can't fetch data",
                    success : false,
                    error : error.message
                })
            } 
        } catch (error) {
            res.status(500).json({
                message : " SQL Query Execution Failed | Can't fetch data",
                success : false,
                error : error.message
            })
        } 
    } else {
        res.status(422).json({
            message : "Unprocessable Entity",
            success : false,
            error : result.error.message
        })
    }
}) 

module.exports = router;