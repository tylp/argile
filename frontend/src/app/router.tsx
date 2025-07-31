import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { paths } from "@/config/paths";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { useMemo } from "react";
import { ProtectedRoute } from "@/lib/auth";

import {
	default as AppRoot,
	ErrorBoundary as AppRootErrorBoundary,
} from "./routes/app/root";

const convert = (queryClient: QueryClient) => (m: any) => {
	const { clientLoader, clientAction, default: Component, ...rest } = m;
	return {
		...rest,
		loader: clientLoader?.(queryClient),
		action: clientAction?.(queryClient),
		Component,
	};
};

export const createAppRouter = (queryClient: QueryClient) => {
	return createBrowserRouter([
		{
			path: paths.auth.login.path,
			lazy: () =>
				import("./routes/auth/login").then(convert(queryClient)),
		},
		{
			path: paths.home.path,
			element: (
				<ProtectedRoute>
					<AppRoot />
				</ProtectedRoute>
			),
			ErrorBoundary: AppRootErrorBoundary,
		},
		{
			path: "*",
			lazy: () => import("./routes/not-found").then(convert(queryClient)),
		},
	]);
};

export const AppRouter = () => {
	const queryClient = useQueryClient();
	const router = useMemo(() => createAppRouter(queryClient), [queryClient]);
	return <RouterProvider router={router} />;
};
