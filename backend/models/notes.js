import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
    {
        noteName: {
            type: String,
            required: true
        },
        noteContent: {
            type: String,
            required: true
        },
        folderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Folder",
            required: true
        }
    },
    {timestamps: true}
);

const Note = mongoose.model("Note", NoteSchema);

export default Note;

