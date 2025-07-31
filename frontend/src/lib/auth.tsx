import { configureAuth } from "react-query-auth";
import { Navigate, useLocation } from "react-router";
import { z } from "zod";
import { paths } from "@/config/paths";
import type { AuthResponse, User } from "@/types/api";
import { api } from "./api-client";
import { removeCookie, setCookie } from "typescript-cookie";

const API_ROUTE = {
	ME: "/auth/me",
	LOGIN: "/auth/login",
	LOGOUT: "/auth/logout",
	REGISTER: "/auth/register",
};

const getUser = async (): Promise<User> => {
	const response = await api.get(API_ROUTE.ME);

	return response.data;
};

export const registerInputSchema = z
	.object({
		email: z.string().min(1, "Required"),
		firstName: z.string().min(1, "Required"),
		lastName: z.string().min(1, "Required"),
		password: z.string().min(5, "Required"),
	})
	.and(
		z
			.object({
				teamId: z.string().min(1, "Required"),
				teamName: z.null().default(null),
			})
			.or(
				z.object({
					teamName: z.string().min(1, "Required"),
					teamId: z.null().default(null),
				})
			)
	);

export const loginInputSchema = z.object({
	username: z.string().min(2, "Required"),
	password: z.string().min(5, "Required"),
});

export type LoginInput = z.infer<typeof loginInputSchema>;
const loginWithUsernameAndPassword = (
	data: LoginInput
): Promise<AuthResponse> => {
	return api.post(API_ROUTE.LOGIN, data);
};

export type RegisterInput = z.infer<typeof registerInputSchema>;

const registerWithEmailAndPassword = (
	data: RegisterInput
): Promise<AuthResponse> => {
	return api.post(API_ROUTE.REGISTER, data);
};

const authConfig = {
	userFn: getUser,
	loginFn: async (data: LoginInput) => {
		const response = await loginWithUsernameAndPassword(data);

		const date = new Date();
		date.setTime(date.getTime() + 60 * 60 * 1000); // Set cookie to expire in 1 hour

		setCookie("access_token", response.access_token, { expires: date });

		return response.user;
	},
	registerFn: async (data: RegisterInput) => {
		const response = await registerWithEmailAndPassword(data);
		return response.user;
	},
	logoutFn: async () => {
		removeCookie("access_token", { path: "" });
	},
};

export const { useUser, useLogin, useLogout, AuthLoader } =
	configureAuth(authConfig);

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
	const user = useUser();
	const location = useLocation();

	if (user.isLoading) {
		return <p>Loading...</p>;
	}

	if (!user.data) {
		return (
			<Navigate
				to={paths.auth.login.getHref(location.pathname)}
				replace
			/>
		);
	}

	return children;
};
