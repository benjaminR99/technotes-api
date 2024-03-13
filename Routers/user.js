const express = require('express')
const router = express.Router();
const {getAllEmployees,createNewEmployee,deleteEmployee,updateEmployee} = require('../Controllers/userControllers');
const verifyJWT = require('../middleware/verify');

router.use(verifyJWT)
router.route('/').get(getAllEmployees)
                 .post(createNewEmployee)
                 .patch(updateEmployee)
                 .delete(deleteEmployee)

module.exports = router ;