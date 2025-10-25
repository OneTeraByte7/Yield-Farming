import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AIService {
  /**
   * Chat with AI Strategy Advisor using GPT-4o-mini
   */
  static async chatWithAdvisor(
    userMessage: string,
    conversationHistory: { role: 'user' | 'assistant'; content: string }[] = [],
    userProfile?: {
      investmentAmount?: number;
      expectedReturns?: number;
      targetApy?: number;
    },
    availablePools?: any[]
  ): Promise<string> {
    try {
      // System prompt to guide the AI
      const systemPrompt = `You are an expert AI Strategy Advisor for a yield farming platform. Your role is to:
1. Help users understand their investment goals and risk tolerance
2. Recommend personalized yield farming strategies based on their profile
3. Explain complex DeFi concepts in simple terms
4. Provide insights on APY, risks, and pool selection

${userProfile ? `User Profile:
- Investment Amount: $${userProfile.investmentAmount?.toLocaleString() || 'Not set'}
- Expected Returns: ${userProfile.expectedReturns || 'Not set'}%
- Target APY: ${userProfile.targetApy || 'Not set'}%` : ''}

${availablePools && availablePools.length > 0 ? `Available Pools: ${availablePools.length} pools with varying APYs and risk levels.` : ''}

Keep responses concise, friendly, and actionable. Focus on helping users make informed decisions.`;

      // Build messages array
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        { role: 'user', content: userMessage }
      ];

      // Call OpenAI API with gpt-4o-mini
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      // Get response and clean up formatting
      let response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';

      // Remove markdown asterisks and formatting
      response = response
        .replace(/\*\*/g, '') // Remove bold markdown
        .replace(/\*/g, '')   // Remove italic markdown
        .replace(/#{1,6}\s/g, '') // Remove markdown headers
        .replace(/`/g, '')    // Remove code backticks
        .trim();

      return response;
    } catch (error: any) {
      console.error('OpenAI API Error:', error);

      if (error?.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your configuration.');
      } else if (error?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else if (error?.status === 500) {
        throw new Error('OpenAI service is currently unavailable. Please try again later.');
      }

      throw new Error('Failed to get AI response. Please try again.');
    }
  }

  /**
   * Generate investment strategies using AI
   */
  static async generateStrategies(
    userProfile: {
      investmentAmount: number;
      expectedReturns: number;
      targetApy: number;
    },
    availablePools: any[]
  ): Promise<string> {
    try {
      const systemPrompt = `You are a DeFi strategy generator. Given a user's investment profile and available pools, generate 3-5 different investment strategies.

User Profile:
- Investment: $${userProfile.investmentAmount.toLocaleString()}
- Expected Returns: ${userProfile.expectedReturns}%
- Target APY: ${userProfile.targetApy}%

Available Pools: ${availablePools.length} pools

Generate strategies with varying risk levels (Conservative, Moderate, Aggressive) and explain each strategy's allocation logic in 2-3 sentences. Format as JSON array.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate personalized strategies for this profile. Focus on practical, actionable recommendations.` }
        ],
        temperature: 0.8,
        max_tokens: 800,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('Strategy Generation Error:', error);
      throw new Error('Failed to generate strategies');
    }
  }
}
