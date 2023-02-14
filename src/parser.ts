import { createUpdateStateAction, Store } from "./state";
import { IJSONFetcherFactory, JSONFetcher } from "./fetcher";
import { Album, FillStrategy } from "./filler";
import { Observable } from "./Observer";
import { ParserBuilder } from "./builder";

export interface IParser {
  store: Store;
  fetcher: JSONFetcher;
  filler: FillStrategy;
}
export class Parser implements IParser {
  store!: Store;
  fetcher!: JSONFetcher;
  filler!: FillStrategy;
  constructor(item: IParser) {
    this.store = item.store;
    this.fetcher = item.fetcher;
    this.filler = item.filler;
  }
}

export class ParserFacade {
  parser!: Parser;
  constructor(parser: Parser) {
    this.parser = parser;
  }
  parseJson(): Observable {
    const observable = new Observable(null);
    const parsingAction = createUpdateStateAction("parsing");
    this.parser.store.dispatch(parsingAction);
    this.parser.fetcher.fetchJSON().then(async (json) => {
      for (const entry of Object.entries(JSON.parse(json)) as [
        keyof Album,
        string
      ][]) {
        this.parser.filler.fill(entry[0], entry[1]);
      }
      observable.next(this.parser.filler.filler);
      const waitingAction = createUpdateStateAction("waiting");
      this.parser.store.dispatch(waitingAction);
    });
    return observable;
  }
}
const obs = new ParserFacade(
  new ParserBuilder().setFetcher().setFiller().setStore()
).parseJson();
console.log(obs, "4");
obs.subscribe((val: unknown) => console.log(val, "5"));
