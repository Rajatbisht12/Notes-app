// routes/index.ts - Fixed route order and structure
import express from 'express';
import * as notesController from './controllers/notes.controller';
import * as bookmarksController from './controllers/bookmarks.controller';
import {
  noteValidators,
  bookmarkValidators,
  idParamValidator
} from './utils/validation';

const router = express.Router();

// Notes routes
router.post('/notes', noteValidators, notesController.createNote);
router.get('/notes', notesController.getNotes);
router.get('/notes/:id', idParamValidator, notesController.getNoteById);
router.put('/notes/:id', [...idParamValidator, ...noteValidators], notesController.updateNote);
router.delete('/notes/:id', idParamValidator, notesController.deleteNote);

// Bookmarks routes
router.post('/bookmarks', bookmarkValidators, bookmarksController.createBookmark);
router.get('/bookmarks', bookmarksController.getBookmarks);

// IMPORTANT: fetch-title routes must come BEFORE the :id route to avoid conflicts
router.get('/bookmarks/fetch-title', async (req, res) => {
  const url = req.query.url as string;
  
  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }
  
  try {
    const { getUrlTitle } = await import('./utils/fetchTitle');
    const title = await getUrlTitle(url);
    res.json({ title });
  } catch (error) {
    console.error('Failed to fetch title:', error);
    res.status(500).json({ error: 'Failed to fetch title' });
  }
});

router.post('/bookmarks/fetch-title', async (req, res) => {
  const { url } = req.body;
  
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  try {
    const { getUrlTitle } = await import('./utils/fetchTitle');
    const title = await getUrlTitle(url);
    return res.json({ title });
  } catch (err) {
    console.error('Failed to fetch title:', err);
    return res.status(500).json({ error: 'Failed to fetch title' });
  }
});

// These routes with :id parameters must come AFTER specific routes
router.get('/bookmarks/:id', idParamValidator, bookmarksController.getBookmarkById);
router.put('/bookmarks/:id', [...idParamValidator, ...bookmarkValidators], bookmarksController.updateBookmark);
router.delete('/bookmarks/:id', idParamValidator, bookmarksController.deleteBookmark);

export default router;