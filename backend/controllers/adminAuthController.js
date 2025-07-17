import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret';

export const adminLogin = async (req, res) => {
  const { username, password } = req.body;
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  await prisma.admin.update({ where: { id: admin.id }, data: { lastLogin: new Date() } });

  const token = jwt.sign({ adminId: admin.id, username: admin.username, isAdmin: true }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, admin: { username: admin.username } });
};
