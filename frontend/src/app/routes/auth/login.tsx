import { useNavigate, useSearchParams } from "react-router";

import { AuthLayout } from "@/components/layouts/auth-layout";
import { paths } from "@/config/paths";
import { LoginForm } from "@/features/auth/components/login-form";

function LoginRoute() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const redirectTo = searchParams.get("redirectTo");

	return (
		<AuthLayout title="Log in">
			<LoginForm
				onSuccess={() => {
					navigate(
						`${redirectTo ? `${redirectTo}` : paths.home.getHref()}`,
						{
							replace: true,
						}
					);
				}}
			/>
		</AuthLayout>
	);
}

export default LoginRoute;
