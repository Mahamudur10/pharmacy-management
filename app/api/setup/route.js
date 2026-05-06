import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET() {
  try {
    await client.connect();
    const db = client.db('pharmacy_db');
    const users = db.collection('users');
    
    const existingAdmin = await users.findOne({ email: 'admin@pharmacy.com' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await users.insertOne({
        name: 'Super Admin',
        email: 'admin@pharmacy.com',
        password: hashedPassword,
        role: 'Admin',
        status: 'approved',
        createdAt: new Date()
      });
      return Response.json({ message: 'Admin created successfully' });
    }
    return Response.json({ message: 'Admin already exists' });
  } catch (err) {
    return Response.json({ message: err.message }, { status: 500 });
  } finally {
    await client.close();
  }
}