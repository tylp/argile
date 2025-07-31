import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLogout } from "@/lib/auth";
import { useNavigate } from "react-router";
import { MainLayout } from "@/components/layouts/main-layout";

export const ErrorBoundary = () => {
	return <div>Something went wrong!</div>;
};

const AppRoot = () => {
	const [count, setCount] = useState(0);
	const navigate = useNavigate();
	const logout = useLogout({
		onSuccess: () =>
			navigate("/auth/login", {
				replace: true,
			}),
	});

	return (
		<MainLayout>
			<ThemeToggle />
			<h1>Vite + React</h1>
			<div className="card">
				<Button onClick={() => setCount((count) => count + 1)}>
					count is {count}
				</Button>
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
			<p className="read-the-docs">
				Click on the Vite and React logos to learn more
			</p>
			<button
				onClick={() => {
					logout.mutate({});
				}}
			>
				Logout
			</button>
		</MainLayout>
	);
};

export default AppRoot;
