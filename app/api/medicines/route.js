import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET() {
  try {
    await client.connect();
    const db = client.db('pharmacy_db');
    const medicines = db.collection('medicines');
    const data = await medicines.find({}).sort({ createdAt: -1 }).toArray();
    return Response.json(data);
  } catch (err) {
    return Response.json({ message: err.message }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    await client.connect();
    const db = client.db('pharmacy_db');
    const medicines = db.collection('medicines');
    const result = await medicines.insertOne({
      ...body,
      createdAt: new Date()
    });
    return Response.json({ ...body, _id: result.insertedId });
  } catch (err) {
    return Response.json({ message: err.message }, { status: 500 });
  } finally {
    await client.close();
  }
}