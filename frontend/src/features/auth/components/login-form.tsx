import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { useLogin, loginInputSchema } from "@/lib/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type LoginFormProps = {
	onSuccess: () => void;
};

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
	const login = useLogin({
		onSuccess,
	});
	const form = useForm<z.infer<typeof loginInputSchema>>({
		defaultValues: {
			username: "",
			password: "",
		},
		resolver: zodResolver(loginInputSchema),
	});

	function onSubmit(values: z.infer<typeof loginInputSchema>) {
		login.mutate(values);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<FormField
					control={form.control}
					name="username"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Username</FormLabel>
							<FormControl>
								<Input
									{...field}
									placeholder="Enter your username"
									autoComplete="username"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<Input
									{...field}
									type="password"
									placeholder="Enter your password"
									autoComplete="current-password"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" className="w-full">
					Login
				</Button>
			</form>
		</Form>
	);
};
