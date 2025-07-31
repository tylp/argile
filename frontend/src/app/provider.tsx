import { queryConfig } from "@/lib/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";

type AppProviderProps = {
	children: React.ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
	const [queryClient] = React.useState(
		() => new QueryClient({ defaultOptions: queryConfig })
	);

	return (
		<React.Suspense
			fallback={
				<div className="flex h-screen w-screen items-center justify-center">
					Loading...
				</div>
			}
		>
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
		</React.Suspense>
	);
};
