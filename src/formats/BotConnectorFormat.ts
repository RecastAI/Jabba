import { ICarousselleJson } from './Carousselle';
import { IQuickRepliesJson } from './QuickReplies';

export interface IBotConnectorFormat {
  toJson(): ICarousselleJson | IQuickRepliesJson;
}
