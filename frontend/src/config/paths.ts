export const paths = {
	home: {
		path: "/",
		getHref: () => "/",
	},

	auth: {
		login: {
			path: "/auth/login",
			getHref: (redirectTo?: string | null | undefined) => {
				return `/auth/login${
					redirectTo
						? `?redirectTo=${encodeURIComponent(redirectTo)}`
						: ""
				}`;
			},
		},
	},
} as const;
