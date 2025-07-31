import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layouts/main-layout";

export const ErrorBoundary = () => {
	return <div>Something went wrong!</div>;
};

const AppRoot = () => {
	const [count, setCount] = useState(0);

	return (
		<MainLayout>
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
		</MainLayout>
	);
};

export default AppRoot;
