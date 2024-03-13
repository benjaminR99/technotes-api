const asyncHandler = require('express-async-handler');
const users = require('../Model/User');
const notes = require('../Model/Note');

// @desc get all notes
//@route GET /notes
// access private

const getAllNotes = asyncHandler(
    async (req,res) =>{
        const fetchedNotes = await notes.find().lean();

        if(!fetchedNotes || fetchedNotes.length==0){
            return res.status(404).json({"mesage":"No notes found"})
        }

        const notesWithuser = await Promise.all(fetchedNotes.map(async (note)=>{
            const user = await users.findById(note.user).lean().exec()
            return { ...note, username: user.username }
        }))

        res.json(notesWithuser)
    }
)

const createNewNote = asyncHandler(
    
    async(req,res) =>{
        
        const {user, title, text} = req.body;
        if( !user || !title || !text ){
            return res.status(400).json({"message":"All feilds are required"}) ;
        }
        const duplicate = await notes.findOne({ title }).lean().exec()

        if (duplicate) {
            return res.status(409).json({ message: 'Duplicate note title' })
        }

        const newnote = {
            "user" : user,
            "title": title,
            "text":text
        }
        console.log(newnote) ;
        const result = await notes.create(newnote);
        if(result){
            res.status(201).json({message : `New note ${title} created`})
        }else{
            res.status(400).json({message : `invalid note data received`})
        }
    }
)



// @desc Update a note
// @route PATCH /notes
// @access Private

const updateNote = asyncHandler(
    async(req,res) =>{
        const {id ,user, title, text, completed} = req.body;
        if(! id || !user || !title || !text || typeof completed !== 'boolean'){
            return res.status(400).json({"message":"All feilds are required"}) ;
        }
        const foundNote = await notes.findById(id).exec() ;
        if(!foundNote){
            return res.status(400).json({"message":"note not found"}) ;
        }
        
         // Check for duplicate title
        const duplicate = await notes.findOne({ title }).lean().exec()

        // Allow renaming of the original note 
        if (duplicate && duplicate?._id.toString() !== id) {
            return res.status(409).json({ message: 'Duplicate note title' })
        }
        const existUserId = await users.findOne({_id:user}).lean().exec();
        
        console.log(existUserId)
        if(!existUserId){
            return res.status(400).json({"mage":"user ID does not exist"})
        }
        foundNote.user = user;
        foundNote.title = title;
        foundNote.text = text   ;
        foundNote.completed = completed;

        const result = await foundNote.save();
        res.json({message:`${result.title} updated`})

    }
)



// @desc Delete a note
// @route DELETE /notes
// @access Private

const deleteNote = asyncHandler(
    async(req,res) =>{
        const {id} = req.body;
    if(!id){
        return  res.status(400).json({message: "User ID required"})
    }
    const note = await notes.findById(id).exec();
    if(!note){
        return res.status(400).json({message: "note does not found"})
    }

    const deletedNote = await note.deleteOne();
    if(deleteNote){
        res.json({"message" : `${deleteNote.title} deleted`})
    }else{
        res.status(400).json({"message":"does not deleted"})
    }

    }
)


module.exports = 
{getAllNotes, createNewNote, updateNote,deleteNote}