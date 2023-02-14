export class Observable {
  value: unknown;
  private readonly _observers: Function[];
  constructor(value: unknown) {
    this.value = value;
    this._observers = [];
  }
  subscribe(observer: Function) {
    this._observers.push(observer);
  }
  unsubscribe(observer: Function) {
    const index = this._observers.indexOf(observer);
    this._observers.splice(index, 1);
  }
  next(value: unknown) {
    this.value = value;
    for (const observer of this._observers) {
      observer(value);
    }
  }
}
