import { AppProvider } from "./provider";
import { AppRouter } from "./router";
import { ThemeProvider } from "@/components/theme-provider";

export const App = () => {
	return (
		<AppProvider>
			<ThemeProvider>
				<AppRouter />
			</ThemeProvider>
		</AppProvider>
	);
};
