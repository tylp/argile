import { Navbar } from "../ui/navbar";

type LayoutProps = {
	children: React.ReactNode;
};

export const MainLayout = ({ children }: LayoutProps) => {
	return (
		<div>
			<Navbar />
			<main className="flex-1">
				<div className="container mx-auto px-4 py-8">{children}</div>
			</main>
		</div>
	);
};
