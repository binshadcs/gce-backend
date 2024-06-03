const { Router } = require('express');
const { Db } = require('../../config/db');
const { hashPassword, comparePassword } = require('../util');
const { CreateGroup } = require('../../types');
const router = Router()

router.get('/', (req, res)=> {
    res.status(200).json({
        message : "coordinator!!"
    })
}); 

router.get('/all', async(req, res)=> {
    try {
        const [coordinators] = await Db.promise().query('select * from tbl_group_coordinators')
        if(coordinators.length > 0) {
            res.status(404).json({
                coordinators
            })
            // Db.end()
        } else {
            res.status(200).json({
                message : "coordinators not found"
            })
        }
    } catch (error) {
        console.log(error.message)
        res.status(404).json({
            message : "can't fetch coordinators"
        })
    }
}) 

router.post('/register', async(req, res)=> {
    const { categoryId,
            name,
            location,
            coordinator_name,
            whatsapp_number,
            profession,
            country,
            state,
            district,
            lsg,
            username,
            password
     } = req.body;

    const result = CreateGroup.safeParse({ categoryId,
        name,
        location,
        coordinator_name,
        whatsapp_number,
        profession,
        country,
        state,
        district,
        lsg,
        username,
        password
    })
    if(result.success) {
        const hashedPassword = await hashPassword(password)
        try {
            let [{insertId}] = await Db.promise().query('INSERT INTO tbl_group_coordinators (gp_id, co_ord_name, co_ord_contact, co_profession, co_username, co_password) VALUES(?, ?, ?, ?, ?, ?)',[-1,
                coordinator_name,
                whatsapp_number,
                profession,
                username,
                hashedPassword])
            // console.log(test)
            const group_coordinator_id = insertId;
            try {
                [{insertId}] = await Db.promise().query('INSERT INTO tbl_group_code (gp_name, gp_code, gp_cat_id, dis_id, lsg_id, gp_coord_id, gp_location, gp_country_id, gp_state_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)',[name,
                    name,
                    categoryId,
                    district,
                    lsg,
                    group_coordinator_id,
                    location,
                    country,
                    state
                    ])
                const group_id = insertId;
                try {
                    [{insertId}] = await Db.promise().query('UPDATE tbl_group_coordinators SET gp_id = ? WHERE co_ord_id = ?',[group_id, group_coordinator_id]); 
                    res.status(200).json({
                        group_id,
                        coordinator_id : group_coordinator_id
                    })
                } catch (error) {
                    console.log(error)
                    res.status(404).json({
                        message : "can't insert data"
                    })
                }  

            } catch (error) {
                console.log(error)
                res.status(404).json({
                    message : "can't insert data"
                })
            } 
        } catch (error) {
            console.log(error)
            res.status(404).json({
                message : "can't insert data"
            })
        } 
    } else {
        res.status(400).json({
            message : "Invalid input"
        })
    }
});

router.post('/login', async(req, res)=> {
    const { password } = req.body;
    const result = await comparePassword(password, '$2b$10$XxiqjM4fkoPwtSTzFZTHIebbPksIkqHoLh4tyb/WC3OrakxuoT7sy')
    res.status(200).json({
        message : result
    })
});

module.exports = router;