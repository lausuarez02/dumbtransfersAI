import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  userWallet: { type: String, required: true },
  contactWallet: { type: String, required: true },
  name: { type: String, required: true },
});

const Contact = mongoose.model('Contact', contactSchema);

export async function POST(request: Request) {
  const { NAME, PRIVATE_KEY } = process.env;
  
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI as string);
  }

  if (!NAME || !PRIVATE_KEY) {
    return new Response(
      JSON.stringify({ message: "Environment variables are not set" }),
      { status: 500 }
    );
  }

  const body = await request.json();
  const { userWallet, contactWallet, name } = body;

  if (!userWallet || !contactWallet || !name) {
    return new Response(
      JSON.stringify({ message: "Missing required fields" }),
      { status: 400 }
    );
  }

  // Ensure the transaction is atomic
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if the user already exists in the database
    const existingUser = await Contact.findOne({ userWallet, contactWallet }).session(session);

    if (existingUser) {
      return new Response(
        JSON.stringify({ message: "Contact already exists for this user" }),
        { status: 200 }
      );
    }

    // Create a new contact
    const newContact = new Contact({
      userWallet,
      contactWallet,
      name,
    });

    await newContact.save({ session });

    await session.commitTransaction();

    return new Response(
      JSON.stringify({ message: "Contact saved successfully", contact: newContact }),
      { status: 200 }
    );
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Error saving contact:", error);
    return new Response(
      JSON.stringify({ message: "Failed to save contact", error: error.message }),
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}