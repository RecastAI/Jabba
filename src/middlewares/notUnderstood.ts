import { ChatbotMiddleware, ChatbotMiddlewareNext, IChatbotContext } from '../Chatbot';

export const notUnderstood = (messages: string[3]): ChatbotMiddleware => {
  return async (ctx: IChatbotContext, next: ChatbotMiddlewareNext): Promise<any> => {
    if (ctx.config.mongo && ctx.config.mongo.enabled === true && ctx.session) {
      const count: number = Math.min(ctx.session.consecutiveNotUnderstand, 2);
      ctx.session.consecutiveNotUnderstand++;
      await ctx.session.save();
      await ctx.message.reply([{ type: 'text', content: messages[count] }]);
      return next();
    }
    await ctx.message.reply([{ type: 'text', content: messages[0] }]);
    return next();
  };
};
