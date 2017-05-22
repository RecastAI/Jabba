export interface ICarousselleButtonJson {
  title: string;
  value: string;
  type: string;
}

export interface ICarousselleCardJson {
  title: string;
  subtitle: string;
  imageUrl: string;
  buttons: ICarousselleButtonJson[];
}

export interface ICarousselleJson {
  type: string;
  content: ICarousselleCardJson[];
}

export class CarousselleCard {
  private title: string;
  private subtitle: string;
  private imageUrl: string;
  private buttons: ICarousselleButtonJson[];

  constructor(title: string, subtitle: string, imageUrl: string) {
    this.title = title;
    this.subtitle = subtitle;
    this.imageUrl = imageUrl;
    this.buttons = [];
  }

  public addPostbackButton(title: string, optValue?: string): CarousselleCard {
    const value = optValue ? optValue : title;

    this.buttons.push({
      title,
      value,
      type: 'postback',
    });

    return this;
  }

  public toJson(): ICarousselleCardJson {
    return {
      title: this.title,
      subtitle: this.subtitle,
      imageUrl: this.imageUrl,
      buttons: this.buttons,
    };
  }
}

export class Carousselle {
  private cards: CarousselleCard[];

  constructor() {
    this.cards = [];
  }

  public addCard(card: CarousselleCard): Carousselle {
    this.cards.push(card);
    return this;
  }

  public toJson(): ICarousselleJson {
    return {
      type: 'carouselle',
      content: this.cards.map(c => c.toJson()),
    };
  }
}
