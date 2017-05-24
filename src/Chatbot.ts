import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as mongoose from 'mongoose';
import * as recastai from 'recastai';

import { Session } from './Session.model';

export interface IRecastConfig {
  requestToken: string;
  connectToken?: string;
}

export interface IRecastSdk {
  request: recastai.Request;
  connect: recastai.Connect;
}

export interface IMongoConfig {
  hostname: string;
  database: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  port?: string;
  enabled?: boolean;
}

export interface IChatbotConfig extends IRecastConfig {
  language: 'fr' | 'en';
  mongo?: IMongoConfig;
}

export interface IChatbotContext {
  recastSdk: IRecastSdk;
  config: IChatbotConfig;
  message: recastai.Message;
  conversation?: any;
  session?: Session;
}

export type ChatbotMiddlewareNext = () => Promise<void>;
export type ChatbotMiddleware = (ctx: IChatbotContext, next?: ChatbotMiddlewareNext) => Promise<any>;

export default class Chatbot {
  private config: IChatbotConfig;
  private recastSdk: IRecastSdk;
  private httpServer: express.Express;
  private middlewarePipeline: ChatbotMiddleware[];

  constructor(config: IChatbotConfig) {
    this.config = config;
    this.middlewarePipeline = [];

    if (config.connectToken) {
      this.recastSdk = {
        connect: new recastai.Connect(config.connectToken, config.language),
        request: new recastai.Request(config.requestToken, config.language),
      };
    } else {
      this.recastSdk = {
        connect: new recastai.Connect(config.requestToken, config.language),
        request: new recastai.Request(config.requestToken, config.language),
      };
    }

    this.httpServer = express();
    this.httpServer.use(bodyParser.json());
    this.httpServer.post('/', (req, res) => this.recastSdk.connect.handleMessage(req, res, this.onMessage.bind(this)));

    // typescripts import are read-only by default
    (mongoose as any).Promise = global.Promise;
    if (this.config.mongo) {
      this.config.mongo.enabled = true;
      this.connectToMongo(this.config.mongo);
    }
  }

  public listen(port: number): void {
    this.httpServer.listen(port);
  }

  public use(middleware: ChatbotMiddleware): Chatbot {
    this.middlewarePipeline.push(middleware);
    return this;
  }


  public connectToMongo(config: IMongoConfig): mongoose.MongooseThenable {
    this.config.mongo = config;
    this.config.mongo.enabled = true;
    let auth: string = '';
    if (config.username) {
      auth = `${config.username}:${config.password}@`;
    }

    return mongoose.connect(
      `mongodb://${auth}${config.hostname}:${config.port}/${config.database}?ssl=${config.ssl}`,
    );
  }

  public isMongoEnabled(): boolean {
    return this.config.mongo && this.config.mongo.enabled ? true : false;
  }

  private onMessage(message: recastai.Message): Promise<any> {
    const ctx: IChatbotContext = { message, recastSdk: this.recastSdk, config: this.config };
    let currentMiddlewareIndex: number = 0;

    const execNextMiddleware = (): Promise<any> => {
      const m = this.middlewarePipeline[currentMiddlewareIndex];
      if (m) {
        currentMiddlewareIndex++;
        return m(ctx, execNextMiddleware);
      } else {
        return Promise.resolve();
      }
    };

    if (this.isMongoEnabled() === true) {
      return Session.findOrCreateById(message.conversationId)
        .then((session: Session) => {
          ctx.session = session;
          return execNextMiddleware();
        });
    }
    return execNextMiddleware();
  }

}
