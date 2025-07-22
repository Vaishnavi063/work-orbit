import {
  combineReducers,
  configureStore,
  type Action,
  type ThunkAction,
} from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

import authSlice from "./slices/auth-slice";
import projectsSlice from "./slices/projects-slice";
import contractsSlice from "./slices/contracts-slice";

const rootReducer = combineReducers({
  auth: authSlice,
  projects: projectsSlice,
  contracts: contractsSlice,
});

const persistConfig = {
  key: "root",
  storage,
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
});

type AppDispatch = typeof store.dispatch;
type RootState = ReturnType<typeof store.getState>;
type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
export { type AppDispatch, type RootState, type AppThunk };

export const persistor = persistStore(store);
export default store;
