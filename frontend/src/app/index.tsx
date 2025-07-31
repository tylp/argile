import { CookiesProvider } from "react-cookie";
import { AppProvider } from "./provider";
import { AppRouter } from "./router";
import { ThemeProvider } from "@/components/theme-provider";

export const App = () => {
	return (
		<AppProvider>
			<CookiesProvider>
				<ThemeProvider>
					<AppRouter />
				</ThemeProvider>
			</CookiesProvider>
		</AppProvider>
	);
};
