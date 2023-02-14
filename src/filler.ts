export class Album {
  userId!: string;
  id!: string;
  title!: string;
}

export interface FillStrategy {
  filler: unknown;
  fill(key: string, value: string): void;
}

export class FillAlbum implements FillStrategy {
  constructor(public filler: Album) {}

  fill(key: keyof Album, value: string): void {
    this.filler[key] = value;
  }
}
