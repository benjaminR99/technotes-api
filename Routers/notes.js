const express = require('express')
const router = express.Router();
const {getAllNotes, createNewNote, updateNote,deleteNote} = require('../Controllers/notesController');
const verifyJWT = require('../middleware/verify');

router.use(verifyJWT)

router.route('/').get(getAllNotes)
                 .post(createNewNote)
                 .patch(updateNote)
                 .delete(deleteNote)

module.exports = router ;