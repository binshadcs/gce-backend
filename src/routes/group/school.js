const { Router } = require('express')
const { CreateNGO, CreateSchool } = require('../../types')
const { Db } = require('../../config/db')
const router = Router()

router.get('/all', (req, res)=> {
    res.status(200).json({
        message : "group!! ngo"
    })
}) 

router.post('/register', async(req, res) => {
    const { groupId,
            clubs,
            list_of_classes,
            no_of_students,
            phoneNUmber
        } = req.body;
    const result = CreateSchool.safeParse({ groupId, clubs, list_of_classes, no_of_students, phoneNUmber })
    if(result.success) {
        try {
            const [value] = await Db.promise().query('SELECT dis_id FROM tbl_group_code WHERE gp_id = ?', [groupId])
            if(value.length != 0) {
                const district_id = value[0].dis_id
                try {
                    const [{insertId}] = await Db.promise().query('INSERT INTO tbl_school (group_id, clubs, edu_district, edu_sub_district, no_of_students, list_of_classes, phone_number) VALUES(?,?,?,?,?,?, ?)', [groupId, clubs, district_id, district_id, no_of_students, list_of_classes, phoneNUmber])
                    
                    res.status(200).json({
                        schoolId : insertId,
                        success : true
                    })
                } catch (error) {
                    res.status(500).json({
                        message : "SQL Query Execution Failed | Can't insert data",
                        success : false,
                        error : error.message
                    })
                } 
            } else {
                res.status(204).json({ 
                        message  : "Group not found",
                        success : false
                    })
            }
            
        } catch (error) {
            res.status(500).json({
                message : "can't fetch data",
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