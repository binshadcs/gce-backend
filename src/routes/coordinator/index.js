const { Router } = require('express');
const { Db } = require('../../config/db');
const { hashPassword } = require('../util');
const { CreateGroup, CoordinatorLogin, CoordinatorSpecific } = require('../../types');
const jwt = require('jsonwebtoken');
const { JwtScret } = require('../../config/config');
const { coordinatorAuth } = require('../../middleware/coordinator');

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
    const { username, password } = req.body;
    const result = CoordinatorLogin.safeParse({username, password});
    const hashedPassword = await hashPassword(password)
    if(result.success) {
        try {
            let [value] = await Db.promise().query('SELECT co_username, co_ord_id, gp_id FROM tbl_group_coordinators where co_username = ? or co_password = ? ',[username, hashedPassword]);
            if(value !== undefined) {
                const token = jwt.sign({
                                id: value[0].co_ord_id,
                                groupId : value[0].gp_id,
                                roleId : 2
                            }, JwtScret);
                res.cookie("token", token);
                res.status(200).json({
                    message : "Logged in!"
                })
            } else {
                res.status(404).json({
                    message : "User not found"
                })
            }
        } catch (error) {
            res.status(404).json({
                message : "Can't fecth data"
            })
        }
    } else {
        res.status(400).json({
            message : "Invalid data"
        })
    }
});

router.post('/:id', coordinatorAuth, async(req, res)=> {
    const coordinator_id = req.params.id;
    // console.log(coordinator_id)
    const result = CoordinatorSpecific.safeParse( "tss" )
    console.log(result)
    // if(result.success) {
        // console.log("reached here")
    try {
        const [coordinator] = await Db.promise().query('SELECT co_ord_id, gp_id, co_ord_name, co_ord_contact, co_profession from tbl_group_coordinators where co_ord_id = ?',[coordinator_id]);
        // console.log(coordinator)
        if(coordinator.length > 0) {
            res.status(404).json({
                coordinator
            })
        } else {
            res.status(400).json({
                message : "Coordinator not found"
            })
        }
    } catch (error) {
        res.status(404).json({
            message : "can't fetch category"
        })
    } 
    // } else {
    //     res.status(304).json({
    //         message : "Invalid data"
    //     })
    // }
})

module.exports = router;