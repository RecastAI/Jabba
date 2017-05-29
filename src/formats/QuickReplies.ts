export interface IQuickRepliesButtonJson {
  title: string;
  value: string;
}

export interface IQuickRepliesJson {
  type: string;
  content: {
    title: string;
    buttons: IQuickRepliesButtonJson[];
  };
}

export class QuickReplies {
  private title: string;
  private buttons: IQuickRepliesButtonJson[];

  constructor(title: string) {
    this.title = title;
    this.buttons = [];
  }

  public setTitle(title: string): QuickReplies {
    this.title = title;
    return this;
  }

  public addButton(title: string, optValue?: string): QuickReplies {
    const value = optValue ? optValue : title;

    this.buttons.push({
      title,
      value,
    });

    return this;

  }

  public toJson(): IQuickRepliesJson {
    return {
      type: 'quickReplies',
      content: {
        title: this.title,
        buttons: this.buttons,
      },
    };
  }
}
