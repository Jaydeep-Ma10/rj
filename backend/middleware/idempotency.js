import { v4 as uuidv4 } from 'uuid';

const idempotency = (req, res, next) => {
  // Skip for GET requests
  if (req.method === 'GET') return next();
  
  // Generate a new idempotency key if not provided
  const idempotencyKey = req.headers['idempotency-key'] || uuidv4();
  
  // Attach to request for later use
  req.idempotencyKey = idempotencyKey;
  
  // Set response header
  res.set('Idempotency-Key', idempotencyKey);
  
  next();
};

export default idempotency;
