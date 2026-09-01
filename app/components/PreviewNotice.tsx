/**
 * Mirrors the narrowed shape the root loader sends. Declared here rather than
 * imported from preview.server so this component keeps no link, even a
 * type-only one, to a server-only module.
 */
export type PreviewNoticeStatus = {
	ok: false;
	reason: "missing" | "rejected" | "stale";
};

/**
 * Shown only inside the Studio's Presentation iframe, and only when drafts
 * cannot be loaded.
 *
 * Without it this failure is invisible: the page renders correctly from
 * published content, but there is no content source map, so no field is
 * clickable and the Studio's document pane stays empty. That reads as "the
 * Presentation tool is broken" when the actual cause is one line of .env.
 */
export function PreviewNotice({ status }: { status: PreviewNoticeStatus }) {
	const projectId = import.meta.env.VITE_SANITY_PROJECT_ID as
		| string
		| undefined;

	return (
		<div className="pointer-events-none fixed inset-x-0 bottom-0 z-[9999] flex justify-center p-3">
			<div
				role="status"
				className="pointer-events-auto max-w-xl rounded-panel bg-bark/95 px-4 py-3 text-sm leading-relaxed text-bone shadow-lg backdrop-blur-sm"
			>
				<p className="font-semibold">
					Live editing is off — showing published content
				</p>

				{status.reason === "stale" ? (
					<>
						<p className="mt-1 text-bone/80">
							<code className="rounded bg-bone/15 px-1 py-0.5 text-bone">
								.env
							</code>{" "}
							holds a newer token than this dev server started
							with. Env vars are only read at startup.
						</p>
						<p className="mt-2 text-bone/80">
							Stop the dev server and run{" "}
							<code className="rounded bg-bone/15 px-1 py-0.5 text-bone">
								npm run dev
							</code>{" "}
							again.
						</p>
					</>
				) : (
					<>
						<p className="mt-1 text-bone/80">
							{status.reason === "missing" ? (
								<>
									No{" "}
									<code className="rounded bg-bone/15 px-1 py-0.5 text-bone">
										SANITY_VIEWER_TOKEN
									</code>{" "}
									is set, so drafts cannot be loaded and
									nothing on the page is clickable.
								</>
							) : (
								<>
									Sanity rejected{" "}
									<code className="rounded bg-bone/15 px-1 py-0.5 text-bone">
										SANITY_VIEWER_TOKEN
									</code>
									, so drafts cannot be loaded and nothing on
									the page is clickable.
								</>
							)}
						</p>
						<p className="mt-2 text-bone/80">
							Create a <strong>Viewer</strong> token in the{" "}
							{projectId ? (
								<a
									className="underline underline-offset-2"
									href={`https://sanity.io/manage/project/${projectId}/api#tokens`}
									target="_blank"
									rel="noreferrer"
								>
									Treeworks project
								</a>
							) : (
								"project"
							)}
							, paste it into{" "}
							<code className="rounded bg-bone/15 px-1 py-0.5 text-bone">
								.env
							</code>
							, then restart the dev server.
						</p>
					</>
				)}
				<p className="mt-2 text-bone/60">
					<a
						className="underline underline-offset-2"
						href="/api/preview/status"
						target="_blank"
					>
						/api/preview/status
					</a>{" "}
					reports the details.
				</p>
			</div>
		</div>
	);
}
