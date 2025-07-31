import * as React from "react";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { paths } from "@/config/paths";
import { useUser } from "@/lib/auth";
import hardDrive from "@/assets/hard-drive-transparent-blue.png";

type LayoutProps = {
	children: React.ReactNode;
	title: string;
};

export const AuthLayout = ({ children, title }: LayoutProps) => {
	const user = useUser();
	const [searchParams] = useSearchParams();
	const redirectTo = searchParams.get("redirectTo");

	const navigate = useNavigate();

	useEffect(() => {
		if (user.data) {
			navigate(redirectTo ? redirectTo : paths.home.getHref(), {
				replace: true,
			});
		}
	}, [user.data, navigate, redirectTo]);

	return (
		<>
			<div className="flex min-h-screen flex-row justify-center bg-background py-12 sm:px-6 lg:px-8">
				<div className="flex justify-center items-center sm:mx-auto sm:w-full sm:max-w-md">
					<img
						src={hardDrive}
						alt="Hard Drive"
						className="size-128"
					/>
				</div>
				<div className="flex justify-center flex-col sm:mx-auto sm:w-full sm:max-w-md">
					<h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
						{title}
					</h1>
					{children}
				</div>
			</div>
		</>
	);
};
