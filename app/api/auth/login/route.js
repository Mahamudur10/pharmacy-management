import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    
    await client.connect();
    const db = client.db('pharmacy_db');
    const users = db.collection('users');
    
    const user = await users.findOne({ email });
    if (!user) {
      return Response.json({ message: 'Invalid credentials' }, { status: 400 });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return Response.json({ message: 'Invalid credentials' }, { status: 400 });
    }
    
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    return Response.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    return Response.json({ message: err.message }, { status: 500 });
  } finally {
    await client.close();
  }
}