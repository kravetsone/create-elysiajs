import dedent from "ts-dedent";

export function getPosthogIndex() {
	return dedent /* ts */`
    import { PostHog } from "posthog-node";
    import { config } from "../config.ts";

    export const posthog = new PostHog(config.POSTHOG_API_KEY, {
        host: config.POSTHOG_HOST,
        disabled: config.NODE_ENV !== "production",
    });

    posthog.on("error", (err) => {
        console.error("PostHog had an error!", err)
    })
`;
}
