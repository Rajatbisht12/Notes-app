import { Request, Response } from 'express';
import { db } from '../db/connection';
import { notes } from '../db/schema';
import { eq, sql, and } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';

export const createNote = async (req: Request, res: Response) => {
  try {
    const { title, content, tags = [] } = req.body;
    const [newNote] = await db.insert(notes).values({
      title,
      content,
      tags
    }).returning();
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create note' });
  }
};

export const getNotes = async (req: Request, res: Response) => {
  try {
    const { q: searchTerm, tags } = req.query;
    // Explicitly type the conditions array
    const conditions: SQL[] = [];

    if (searchTerm) {
      conditions.push(
        sql`to_tsvector('english', ${notes.title} || ' ' || ${notes.content}) @@ to_tsquery('english', ${searchTerm})`
      );
    }

    if (tags) {
      const tagArray = String(tags).split(',');
      // Use the sql template for array containment
      conditions.push(sql`${notes.tags} @> ${tagArray}`);
    }

    // Build query with conditional filtering
    const results = conditions.length
      ? await db.select().from(notes).where(and(...conditions))
      : await db.select().from(notes);

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
};

export const getNoteById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    note ? res.json(note) : res.status(404).json({ error: 'Note not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch note' });
  }
};

export const updateNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;
    const [updatedNote] = await db.update(notes)
      .set({ title, content, tags, updatedAt: new Date() })
      .where(eq(notes.id, id))
      .returning();
    updatedNote ? res.json(updatedNote) : res.status(404).json({ error: 'Note not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.delete(notes).where(eq(notes.id, id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
};