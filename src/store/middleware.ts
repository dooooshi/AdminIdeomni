import { createDynamicMiddleware } from '@reduxjs/toolkit/react';
import type { Middleware } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from './store';

const dynamicInstance = createDynamicMiddleware();

export const { middleware: dynamicMiddleware }: { middleware: Middleware } = dynamicInstance;

type Config = {
	state: RootState;
	dispatch: AppDispatch;
};

export const addAppMiddleware = dynamicInstance.addMiddleware.withTypes<Config>();

export const withAppMiddleware = dynamicInstance.withMiddleware.withTypes<Config>();

export const createAppDispatchWithMiddlewareHook = dynamicInstance.createDispatchWithMiddlewareHook.withTypes<Config>();
