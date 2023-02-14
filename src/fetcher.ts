import fetch from "node-fetch";

interface IJSONFetcher {
  fetchJSON(): Promise<string>;
}

export interface IJSONFetcherFactory {
  getJSONFetcher(): IJSONFetcher;
}

export class JSONFetcher implements IJSONFetcher {
  apiEntities = ["posts", "todos", "comments", "albums", "photos"];
  async fetchJSON(): Promise<string> {
    const randomEntity = this.apiEntities[Math.round(Math.random() * 5)];
    const randomId = Math.round(Math.random() * 100);
    return await fetch(
      `https://jsonplaceholder.typicode.com/albums/${randomId}`
    )
      .then((response) => response.json())
      .then((json) => JSON.stringify(json));
  }
}

export class JSONFetcherFactory implements IJSONFetcherFactory {
  getJSONFetcher(): JSONFetcher {
    return new JSONFetcher();
  }
}
