import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
    dangerouslyAllowBrowser: true 
});

export async function transactionAssistant(userMessage: string): Promise<any> {
  
    const messages = [
      {
        role: 'system',
        content: `You are a financial transaction assistant. Generate a response based on the following instructions:
          - Respond to the user's query in just one line.
          - Only output JSON in the following format: { "answer": "Transaction made: 'amount the user sent'", "transactionLink": "transactionlink"}`,
      },
      { role: 'user', content: `Answer this user query: ${userMessage}` },
    ] as any;
  
    try{
      const responseStream = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages ,
        stream: true,
      });
    
      const chunks = [];
            for await (const chunk of (responseStream as any).iterator()) {
              if(chunk.choices[0]?.delta?.content){
                chunks.push(chunk.choices[0].delta.content);
              }
            }
            const jsonResponse = chunks.join('');
  
                   const outputJson = JSON.parse(jsonResponse);
                  console.log(outputJson, "test jsonResponse:")
    
        return outputJson;
    }catch(e){
      console.error(e)
    }
  }
  
  export async function extractTransactionDetails(userMessage: string): Promise<any> {
  const messages = [
    {
      role: 'system',
      content: `You are a transaction assistant. Extract the amount of money the user wants to send and the recipient's details from the user's message. Format the response in JSON with the following structure: { "amount": <amount>, "recipient": "<recipient name or address>" }. If no amount or recipient is found, return null for that field.`,
    },
    { role: 'user', content: `User message: ${userMessage}` },
  ] as any;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
    });

    const assistantMessage = response.choices[0]?.message?.content;
    const extractedData = JSON.parse(assistantMessage);

    return extractedData;
  } catch (e) {
    console.error('Error extracting transaction details:', e);
    return null;
  }
}
