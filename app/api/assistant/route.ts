import { mainAssistant } from '@/app/utils/ai';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  // Ensure the MongoDB connection is established
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI as string);
  }

  // Extract user message from the request body
  const { message: userMessage, mpcWallet, address } = await request.json();

  // Call the mainAssistant function
  const response = await mainAssistant(userMessage, mpcWallet, address);

  // Return the response
  return new Response(JSON.stringify(response), { status: 200 });
}