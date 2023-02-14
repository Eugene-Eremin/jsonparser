type Status = "parsing" | "waiting";
interface AppState {
  status: Status;
}
interface Action {
  name: string;
  payload: any;
}
export const createUpdateStateAction = (payload: Status): Action => {
  return { name: "UPDATE_STATE", payload };
};

export class Reducer {
  reduce(state: AppState, action: Action): AppState {
    switch (action.name) {
      case "UPDATE_STATE":
        return { ...state, status: action.payload };
      default:
        return { ...state };
    }
  }
}
export class Store {
  state: AppState = { status: "waiting" };
  constructor(private reducer: Reducer) {}
  dispatch(action: Action) {
    this.state = this.reducer.reduce(this.state, action);
  }
}
