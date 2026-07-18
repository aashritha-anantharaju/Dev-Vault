import express from 'express';
import Note from '../models/Note.js';

const router = express.Router();

// GET /api/notes - Retrieve all notes sorted by newest first (supports optional search query)
router.get('/', async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      };
    }
    const notes = await Note.find(query).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    next(error);
  }
});

// POST /api/notes - Create a new note
router.post('/', async (req, res, next) => {
  try {
    const { title, description, image, link } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const note = new Note({ title, description, image, link });
    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    next(error);
  }
});

// PUT /api/notes/:id - Update an existing note
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, image, link } = req.body;

    const updatedNote = await Note.findByIdAndUpdate(
      id,
      { title, description, image, link },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(updatedNote);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/notes/:id - Delete a note
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedNote = await Note.findByIdAndDelete(id);
    if (!deletedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
