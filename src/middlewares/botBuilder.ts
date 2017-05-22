import { ChatbotMiddleware, ChatbotMiddlewareNext, IChatbotContext } from '../Chatbot';

export const converseApiCall = (): ChatbotMiddleware => {
  return async (ctx: IChatbotContext, next: ChatbotMiddlewareNext) => {
    ctx.conversation = await ctx.recastSdk.request.converseText(ctx.message.content, {
      conversationToken: ctx.message.senderId,
      language: ctx.config.language,
    });
    next();
  };
};
