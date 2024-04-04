const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

// ROUTE 1 - Get All the notes using : POST "/api/notes/fetchallnotes". Login Required
router.get("/fetchallnotes", fetchuser, async (req, res) => {

    try {
        const notes = await Note.find({user: req.user.id});
        res.json(notes);
    } catch (error) {
        // Catch errors

        console.error(error.message);
        res.status(500).send("Some error occurred");
    }
    
});

// ROUTE 2 - Add a new note using : POST "/api/notes/addnote". Login Required
router.post("/addnote", fetchuser, [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 characters").isLength({min: 5}),
], async (req, res) => {

    try {
        const{title, description, tag} = req.body;
        // If there are any errors, return Bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        const note = new Note({
            title, description, tag, user : req.user.id
        })

        const savedNote = note.save()
        res.json(note);
    } catch (error) {
        // Catch errors

        console.error(error.message);
        res.status(500).send("Some error occurred");
    }
    
});


// ROUTE 3 - Update an existing note using : POST "api/notes/updatenote" .Login required
router.put("/updatenote/:id", fetchuser, [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 characters").isLength({min: 5}),
], async (req, res) => {

    try {

        const{title, description, tag} = req.body;
        const { id } = req.params;
        
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }
        
        // Update the note in the database
        const updatedNote = await Note.findByIdAndUpdate(id, { title, description, tag }, { new: true });
        const note = await Note.findById(req.params.id);
        if (!updatedNote) {
            return res.status(404).json({ message: 'Note not found' });
        }

        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not Allowed");
        }

        res.json({updatedNote});

    } catch (error) {
        // Catch errors

        console.error(error.message);
        res.status(500).send("Some error occurred");
    }
    
});

// ROUTE 4 - Delete an existing note using : POST "api/notes/delete" .Login required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {

    try {

        const { id } = req.params;
        
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }
        
        
        const note = await Note.findById(req.params.id);
        
        
        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not Allowed");
        }
        
        // Delete the note in the database
        const deleteNote = await Note.findByIdAndDelete(id);
        res.json({"Success": "The note has been successfully deleted",note : deleteNote});

    } catch (error) {
        // Catch errors

        console.error(error.message);
        res.status(500).send("Some error occurred");
    }
    
});

// 65f81693c201742686025ca0
module.exports = router;
