import { Request, Response } from 'express';
import { db } from '../db/connection';
import { bookmarks } from '../db/schema';
import { eq, sql, and } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { getUrlTitle } from '../utils/fetchTitle';

export const createBookmark = async (req: Request, res: Response) => {
  try {
    let { url, title, tags = [] } = req.body;
    
    if (!title) {
      title = await getUrlTitle(url);
    }

    const [newBookmark] = await db.insert(bookmarks).values({
      url,
      title,
      tags
    }).returning();
    
    res.status(201).json(newBookmark);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create bookmark' });
  }
};

export const getBookmarks = async (req: Request, res: Response) => {
  try {
    const { q: searchTerm, tags } = req.query;
    // Explicitly type the conditions array
    const conditions: SQL[] = [];

    if (searchTerm) {
      conditions.push(
        sql`to_tsvector('english', ${bookmarks.title} || ' ' || ${bookmarks.url}) @@ to_tsquery('english', ${searchTerm})`
      );
    }

    if (tags) {
      const tagArray = String(tags).split(',');
      // Use the sql template for array containment
      conditions.push(sql`${bookmarks.tags} @> ${tagArray}`);
    }

    // Build query with conditional filtering
    const results = conditions.length
      ? await db.select().from(bookmarks).where(and(...conditions))
      : await db.select().from(bookmarks);

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
};

export const getBookmarkById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [note] = await db.select().from(bookmarks).where(eq(bookmarks.id, id));
    note ? res.json(note) : res.status(404).json({ error: 'Note not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch note' });
  }
};

export const updateBookmark = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, url, tags } = req.body;
    const [updatedNote] = await db.update(bookmarks)
      .set({ title, url, tags, updatedAt: new Date() })
      .where(eq(bookmarks.id, id))
      .returning();
    updatedNote ? res.json(updatedNote) : res.status(404).json({ error: 'Note not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
};

export const deleteBookmark = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.delete(bookmarks).where(eq(bookmarks.id, id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
};