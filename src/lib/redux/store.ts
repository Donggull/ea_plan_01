'use client'

import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from '@reduxjs/toolkit'

// Workflow slices
import proposalSlice from './slices/proposalSlice'
import developmentSlice from './slices/developmentSlice'
import operationSlice from './slices/operationSlice'
import workflowDataSlice from './slices/workflowDataSlice'

const persistConfig = {
  key: 'root',
  storage,
  version: 1,
  whitelist: [
    'proposalData',
    'developmentData',
    'operationData',
    'workflowData',
  ],
}

const rootReducer = combineReducers({
  proposalData: proposalSlice,
  developmentData: developmentSlice,
  operationData: operationSlice,
  workflowData: workflowDataSlice,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
