const { Router } = require('express')
const activityRoute = require('./activities/index');
const categoryRoute = require('./category/index');
const coordinatorRoute = require('./coordinator/index');
const groupRoute = require('./group/index');
const uploadRoute = require('./uploads/index');
const userRoute = require('./user/index');

const router = Router()

router.use("/category", categoryRoute)
router.use('/activity', activityRoute);
router.use('/coordinator', coordinatorRoute);
router.use('/group', groupRoute);
router.use('/upload', uploadRoute);
router.use('/user', userRoute);

module.exports = router;