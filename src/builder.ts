import { Parser } from "./parser";
import { JSONFetcher, JSONFetcherFactory } from "./fetcher";
import { Album, FillAlbum, FillStrategy } from "./filler";
import { Reducer, Store } from "./state";

export class ParserBuilder {
  fetcher!: JSONFetcher;
  filler!: FillStrategy;
  store!: Store;
  setFetcher(fetcherFactory?: JSONFetcherFactory) {
    this.fetcher = (
      fetcherFactory || new JSONFetcherFactory()
    ).getJSONFetcher();
    return this;
  }
  setFiller(filler?: FillStrategy) {
    this.filler = filler || new FillAlbum(new Album());
    return this;
  }
  setStore(store?: Store) {
    this.store = store || new Store(new Reducer());
    return this;
  }
  build() {
    return new Parser(this);
  }
}
