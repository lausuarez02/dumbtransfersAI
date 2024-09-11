import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true 
});

  async function generalAssistant(generalDetails: any, language: string) {
    const { answer } = generalDetails;
  
    const translatedAnswer = await translateAssistant(answer, language);
    return translatedAnswer;
  }

  import mongoose from 'mongoose';

  // Define a schema for contacts
  const contactSchema = new mongoose.Schema({
    userWallet: String,
    contactWallet: String,
    name: String,
  });
  
  const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);
  
  let conversationState: any = {};

  const fetchTransactionData = async (address:any,addressTo:string, amount:any) => {
    // if (!address || !amount) throw new Error("Address and amount must be provided");
    // setIsLoading(true)
    const response = await fetch("https://www.dumbtransfers.com/api", {
      method: "POST",
      body: JSON.stringify({ address, amount, addressTo }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    // setIsLoading(false)
    // if (!response.ok) {
    //   throw new Error("Network response was not ok");
    // }
    
    console.log(response, "check the response dude")
    let responseData = response.json()
    return responseData;
  };
  
  // Main Assistant Function
  export async function mainAssistant(userMessage: string, mpcWallet:string, address:string): Promise<any> {
    const language = await detectLanguage(userMessage);

    console.log(conversationState.waitingFor, "check waitingFor001")
    console.log(userMessage, "chec the usermessage")
    if (conversationState.waitingFor === 'saveContactName') {
      
         await saveContactInDB({
        userWallet: mpcWallet, 
        contactWallet: conversationState.contactWallet,
        name: userMessage,
      });

      const response = await translateAssistant(`Contact saved as ${userMessage}.`, language);
      conversationState = {}; // Clear the state after saving
      return response;
    }
      // Check if there's an active state
      console.log(conversationState.waitingFor, "check waitingFor001")

  if (conversationState.waitingFor === 'saveContact') {
    const userResponse = userMessage.toLowerCase().trim();
    console.log(conversationState.waitingFor, "check waitingFor")
    
    if (userResponse === 'yes') {
      conversationState = {
        waitingFor: 'saveContactName',
        userWallet: mpcWallet, // Get this from the user's session
        contactWallet: conversationState.contactWallet,
      };
      const translatedName = await translateAssistant("Name", language);
      const translatedSend = await translateAssistant("Enviar", language);

      let response;
      // Append both Yes and No buttons to the response string
      response = {
        text: `${await translateAssistant("Type the name you want to give it", language)}`,
        hasButtonName: true,
        hasInput:true,
        translatedName: translatedName,
        translatedSend: translatedSend
      };
      // response = ` ${await translateAssistant("Type the name you want to give it", language)} 
      // <input class="save-contact-name" type="text" placeholder="${translatedName}" />
      // <button class="save-contact-btn-name">${translatedSend}</button>
      // `
      return response;
    } else {
      conversationState = {}; // Clear the state if user doesn't want to save
      return await translateAssistant("Okay, the contact won't be saved.", language);
    }
  }


    const messages = [
      {
        role: 'system',
        content: `You are an assistant that handles financial transactions, token swaps, and general questions.
        - If the user asks for a transaction but doesn't provide the amount or recipient, ask for the missing information.
        - If the user asks for a token swap but doesn't provide the amount or tokens, ask for the missing details.
        - Respond in the language of the user message and with the following format:
          {
            "type": "transaction",
            "complete": boolean,
            "amount": number | null,
            "to": "address or contact name" | null,
            "missingDetails": ["amount", "to"] | []
          }
        - For swaps, respond with:
          {
            "type": "swap",
            "complete": boolean,
            "fromToken": "TOKEN1" | null,
            "toToken": "TOKEN2" | null,
            "amount": number | null,
            "missingDetails": ["fromToken", "toToken", "amount"] | []
          }
        - For general questions, respond with:
          {
            "type": "general",
            "answer": "some general response"
          }.`
      },
      { role: 'user', content: userMessage },
    ] as any;
  
    try {
      const responseStream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        stream: true,
      });
  
      const chunks = [];
      for await (const chunk of (responseStream as any).iterator()) {
        if (chunk.choices[0]?.delta?.content) {
          chunks.push(chunk.choices[0].delta.content);
        }
      }
  
      const jsonResponse = chunks.join('');
      const parsedResponse = JSON.parse(jsonResponse.replace(/'/g, '"'));
  
      let response;
      // Check the type of response
      if (parsedResponse.type === "transaction") {
        const existingContact = await Contact.findOne({
          $or: [
            { contactWallet: parsedResponse.to },
            { name: { $regex: new RegExp(`^${parsedResponse.to}$`, 'i') } } // case-insensitive search for name
          ]
        });

        console.log(existingContact, "check if there is existingcontact")
      
        if (existingContact) {
          parsedResponse.contactName = existingContact.name;
        }
      
        console.log(parsedResponse, "check the parsedresponse")
        response = await transactionAssistant(parsedResponse, existingContact, language, address);
      
        // If transaction successful and contact not found, ask to save it
        if (!existingContact && response?.includes("successful")) {
          conversationState = {
            waitingFor: 'saveContact',
            userWallet: mpcWallet, // Get this from the user's session
            contactWallet: parsedResponse.to,
          };
          const translatedYes = await translateAssistant("Yes", language);
          const translatedNo = await translateAssistant("No", language);
        
          // Append both Yes and No buttons to the response string
          response = {
            text: response + ` ${await translateAssistant("Transaction successful! Would you like to save this contact?", language)}`,
            hasButton: true,
            buttonTextYes: translatedYes,
            buttonTextNo: translatedNo
          };
          // response += ` ${await translateAssistant("Would you like to save this contact?", language)} 
          // <button class="save-contact-btn-yes">${translatedYes}</button>
          // <button class="save-contact-btn-no">${translatedNo}</button>`;
          // response += ` ${await translateAssistant("Would you like to save this contact?", language)}`;      
        }

      } else if (parsedResponse.type === "swap") {
        response = await swapAssistant(parsedResponse, language);
      } else if (parsedResponse.type === "general") {
        response = await generalAssistant(parsedResponse, language);
      }
  
      return response;
    } catch (e) {
      console.error(e);
    }
  }
  
  async function detectLanguage(userMessage: string): Promise<string> {
    const prompt = `
    Detect the language of the following message and return the language code (like 'en' for English, 'es' for Spanish, 'ar' for Arabic, etc.):
    "${userMessage}"
    Only return the language code.
    `;
  
    const messages = [
      { role: 'system', content: 'You are a language detection assistant.' },
      { role: 'user', content: prompt },
    ] as any;
  
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo', // Use the appropriate model
        messages,
      });
  
      const detectedLanguage = response.choices[0].message?.content?.trim() || 'en'; // Default to 'en' (English) if detection fails
  
      return detectedLanguage;
    } catch (e) {
      console.error('Language detection failed:', e);
      return 'en'; // Fallback to English if detection fails
    }
  }

  
  // Transaction Assistant Function
  async function transactionAssistant(
    transactionDetails: any, 
    existingContact: any, 
    userLanguage: string,
    address:string
  ) {
    const { complete, amount, to, missingDetails } = transactionDetails;
  
    if (!complete) {
      // Combine the messages if both details are missing
      let message = '';
    
      if (missingDetails.includes('amount') && missingDetails.includes('to')) {
        message = "Please provide both the amount for the transaction and the recipient's address.";
      } else if (missingDetails.includes('amount')) {
        message = "Please provide the amount for the transaction.";
      } else if (missingDetails.includes('to')) {
        message = "Please provide the recipient's address.";
      }
    
      if (message) {
        return translateAssistant(message, userLanguage);
      }
    }

    let transactionResult;
    if(existingContact){
      transactionResult = await fetchTransactionData(address, existingContact.contactWallet, amount);
    }else{
      transactionResult = await fetchTransactionData(address, to, amount);

    }
    // Perform the transaction (pseudo-code, replace with your actual transaction logic)
  
    console.log(transactionResult, "check the transactionREsult man")
    // Return the success or failure message
    if (transactionResult.transactionLink) {
      const recipientName = existingContact ? existingContact.name : to;
      return translateAssistant(
        `
        Transaction of ${amount} USDC to ${recipientName} was successful! 
        Transaction Link: ${transactionResult.transactionLink}
        `, userLanguage);
    } else {
      return translateAssistant("Transaction failed. Please try again.", userLanguage);
    }
  }
  
  // Save Contact in Database Function
  async function saveContactInDB(contactData: any) {
    const newContact = new Contact(contactData);
    await newContact.save();
  }
  
  // Example function to get contact name from the user
  async function getContactNameFromUser(userLanguage: string): Promise<string> {
    // Logic to get the name from the user in their language
    console.log(translateAssistant("Please provide a name for this contact.", userLanguage));
    return "John Doe"; // Placeholder: Implement actual logic to get the name from the user
  }
  
  // Example function to perform a transaction
  async function performTransaction(amount: number, to: string): Promise<any> {
    // Placeholder: Implement your transaction logic here
    return { success: true };
  }
  
  async function translateAssistant(message: string, language: string): Promise<string> {
    console.log(message, "checkout the message001")
    const prompt = `
    Translate the following message to ${language}:
    ${message}
    If the language is English, just return the message as is.
    `;
  
    const messages = [
      { role: 'system', content: 'You are a translation assistant.' },
      { role: 'user', content: prompt },
    ] as any;
  
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo', // Use the appropriate model
        messages,
      });
  
      const translatedMessage = response.choices[0].message?.content?.trim() || message;
  
      console.log(translatedMessage, "checkout the translatedMessage001")

      return translatedMessage;
    } catch (e) {
      console.error('Translation failed:', e);
      return message; // Fallback to the original message if translation fails
    }
  }
  
  // Updated swapAssistant with translation
  async function swapAssistant(swapDetails: any, language: string) {
    const { complete, fromToken, toToken, amount, missingDetails } = swapDetails;
  
    let response;
    if (!complete) {
      if (missingDetails.includes('fromToken')) {
        const response = await translateAssistant("Please provide the token you want to swap from.", language);
        console.log(response);
      }
      if (missingDetails.includes('toToken')) {
        const response = await translateAssistant("Please provide the token you want to swap to.", language);
        console.log(response);
      }
      if (missingDetails.includes('amount')) {
        const response = await translateAssistant("Please provide the amount for the swap.", language);
        console.log(response);
      }
      return response
    }
  }
