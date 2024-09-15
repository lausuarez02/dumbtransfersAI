import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  userWallet: { type: String, required: true },
  contactWallet: { type: String, required: true },
  name: { type: String, required: true },
});

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  console.log(address, "check the address")
  if (!address) {
    return new Response(JSON.stringify({ error: 'Wallet address is required' }), { status: 400 });
  }

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }

    const existingUser = await Contact.find({ userWallet: address });
    
    console.log(existingUser, "check the existingUser")
    if (!existingUser.length) {
      return new Response(JSON.stringify({ error: 'No contacts found for this address' }), { status: 404 });
    }

    return new Response(JSON.stringify(existingUser), { status: 200 });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
