import { body, param } from 'express-validator';
import { isURL } from 'validator';

export const noteValidators = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
];

export const bookmarkValidators = [
  body('url')
    .trim()
    .custom(url => {
      if (!isURL(url)) throw new Error('Invalid URL');
      return true;
    }),
  body('title').trim().optional(),
  body('tags').optional().isArray().withMessage('Tags must be an array')
];

export const idParamValidator = [
  param('id').isUUID().withMessage('Invalid ID format')
];