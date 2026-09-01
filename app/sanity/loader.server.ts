import { createClient } from "@sanity/client";
import { loadQuery, setServerClient } from "./loader";
import { projectId, dataset, apiVersion, studioUrl } from "./env";

const token = process.env.SANITY_VIEWER_TOKEN;

/**
 * Unauthenticated client for published content.
 *
 * The dataset is public, so published reads need no credentials. Keeping them
 * on a tokenless client is deliberate: a revoked or mistyped preview token then
 * breaks preview only, instead of taking every page down with
 * "Unauthorized - Session not found".
 */
export const publicClient = createClient({
	projectId,
	dataset,
	apiVersion,
	useCdn: true,
	stega: false,
});

/**
 * Authenticated client, used only for draft reads and for validating the
 * Presentation preview secret (a private `sanity.previewUrlSecret` document the
 * public client cannot see).
 *
 * @sanity/react-loader refuses `perspective: "drafts"` unless the client
 * registered with setServerClient carries a token, so this is what gets
 * registered — but nothing reaches it unless draft mode is on.
 */
export const previewAuthClient = createClient({
	projectId,
	dataset,
	apiVersion,
	useCdn: false,
	token,
	stega: { enabled: Boolean(token), studioUrl },
});

setServerClient(previewAuthClient);

export { loadQuery };
