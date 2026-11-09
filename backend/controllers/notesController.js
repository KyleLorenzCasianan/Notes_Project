import Note from "..models/notes.js"

export const getNotes= async (req, res) => {
    try{
        const notes = await Note.find();
        res.json(notes);
    } catch (error) {
        console.error("Error fetching notes:", error);
        res.status(500).json ({ message: "Server error" })
    }
}

export const createNote = async (req, res) => {
    try{
        const { noteName, noteContent, folderId } = req.body

        if(!noteName || !noteContent || !folderId) {
            return res.status(400).json({ message: "Note name, note content, and folder ID are required" });
        }

        const newNote = await Note.create({ noteName, noteContent, folderId });
        res.status(201).json(newNote);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

export const getNoteById = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }
        res.json(note);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

export const updateNote = async (req, res) => {
    try {
        const { noteName, noteContent } = req.body;
        const note = await Note.findByIdAndUpdate(
            req.params.id,
            { noteName, noteContent },
            { new: true }
        );
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }
        res.json(note);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

export const deleteNote = async (req, res) => {
    try {
        const note = await Note.findByIdAndDelete(req.params.id);
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }
        res.json({ message: "Note deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}