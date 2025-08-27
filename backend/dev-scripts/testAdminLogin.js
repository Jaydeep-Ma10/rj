// scripts/testAdminLogin.js
import { prisma } from '../prisma/client.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    
    // Check if admin exists
    const admin = await prisma.admin.findUnique({
      where: { username: 'admin' }
    });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:', {
      id: admin.id,
      username: admin.username,
      createdAt: admin.createdAt,
      lastLogin: admin.lastLogin
    });
    
    // Test password verification
    const testPassword = 'Admin@123';
    const isValidPassword = await bcrypt.compare(testPassword, admin.password);
    
    console.log(`Password verification for '${testPassword}':`, isValidPassword ? '✅ Valid' : '❌ Invalid');
    
    if (isValidPassword) {
      // Generate JWT token
      const JWT_SECRET = process.env.JWT_SECRET || 'changeme_development_only';
      const token = jwt.sign(
        { adminId: admin.id, username: admin.username, isAdmin: true }, 
        JWT_SECRET, 
        { expiresIn: '1d' }
      );
      
      console.log('✅ Generated admin token for testing');
      console.log('Token preview:', token.substring(0, 50) + '...');
      
      // Test admin API endpoint
      console.log('\n--- Testing Admin Login API ---');
      const loginResponse = await fetch('http://localhost:5000/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'Admin@123'
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Admin login API successful');
        console.log('Login response:', loginData);
      } else {
        console.log('❌ Admin login API failed:', loginResponse.status, loginResponse.statusText);
        const errorText = await loginResponse.text();
        console.log('Error response:', errorText);
      }
    }
    
  } catch (error) {
    console.error('Error testing admin login:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminLogin();
