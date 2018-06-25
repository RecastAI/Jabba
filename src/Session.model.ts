import * as mongoose from 'mongoose';

export interface ISessionModel {
  conversationId: string;
  consecutiveNotUnderstand: number;
  createdAt: Date;
  updatedAt: Date;
  memory: object;
  messageCount: number;
}

export interface ISessionDocument extends ISessionModel, mongoose.Document {}

const sessionSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: false,
  },
  updatedAt: {
    type: Date,
    required: false,
  },
  consecutiveNotUnderstand: {
    type: Number,
    default: 0,
    required: false,
  },
  memory: {
    type: Object,
    default: {},
  },
  messageCount: {
    type: Number,
    default: 0,
  },
});

sessionSchema.index({ conversationId: 1 });

sessionSchema.pre('save', next => {
  if (this._doc) {
    const doc = this._doc as ISessionModel;
    const now = new Date();
    if (!doc.createdAt) {
      doc.createdAt = now;
    }
    doc.updatedAt = now;
  }
  next();
});

export const SessionModel = mongoose.model('Session', sessionSchema);

export class Session {
  public _previousNotUnderstand: number;

  public static create(conversationId: string): Promise<Session> {
    const instance: ISessionModel = {
      conversationId,
      consecutiveNotUnderstand: 0,
      messageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      memory: {},
    };

    return SessionModel.create(instance).then(
      (res: mongoose.Document) => new Session(res as ISessionDocument)
    );
  }

  public static findById(conversationId: string): Promise<Session> {
    return SessionModel.findOne({ conversationId }).then((res: mongoose.Document) => {
      if (!res) {
        return Promise.reject(`Sersation with id ${conversationId} not found.`);
      }
      return Promise.resolve(new Session(res as ISessionDocument));
    });
  }

  public static findOrCreateById(conversationId: string): Promise<Session> {
    return SessionModel.findOne({ conversationId }).then((res: mongoose.Document) => {
      if (!res) {
        return this.create(conversationId);
      }
      return Promise.resolve(new Session(res as ISessionDocument));
    });
  }

  private document: ISessionDocument;

  constructor(model: ISessionDocument) {
    this._previousNotUnderstand = 0;
    this.document = model;
  }

  get conversationId(): string {
    return this.document.conversationId;
  }

  get memory(): object {
    return this.document.memory;
  }

  get consecutiveNotUnderstand(): number {
    return this.document.consecutiveNotUnderstand;
  }

  set consecutiveNotUnderstand(n: number) {
    this.document.consecutiveNotUnderstand = Math.min(n, 2);
  }

  get messageCount(): number {
    return this.document.messageCount;
  }

  set messageCount(n: number) {
    this.document.messageCount = n;
  }

  public save(): Promise<Session> {
    this.document.markModified('memory');
    return this.document.save().then(() => this);
  }

  public reset(): Promise<Session> {
    this.document.consecutiveNotUnderstand = 0;
    this.document.messageCount = 0;
    this.document.memory = {};
    return this.save();
  }
}
