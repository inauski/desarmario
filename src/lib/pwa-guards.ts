const PROJECT_ID = "0d4a9a56-1a5c-43a1-9ed9-ccbca29680ba";
const PREVIEW_SUFFIXES = [".lovable.app", ".gpt-eng.com", ".gptengineer.run"];

interface GuardOptions {
  isProduction: boolean;
  hostname: string;
  isIframe: boolean;
  search: string;
}

export function shouldSkipServiceWorker({ isProduction, hostname, isIframe, search }: GuardOptions) {
  const host = hostname.toLowerCase();
  const firstLabel = host.split(".")[0] ?? "";
  const isKnownPreviewDomain = PREVIEW_SUFFIXES.some((suffix) => host.endsWith(suffix));
  const isPreviewLabel = /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/.test(firstLabel);
  const isProjectDevHost = PREVIEW_SUFFIXES.some((suffix) => host === `project--${PROJECT_ID}-dev${suffix}`);
  const isEditorHost = ["lovableproject.com", "lovableproject-dev.com", "beta.lovable.dev"].some(
    (domain) => host === domain || host.endsWith(`.${domain}`),
  );

  return !isProduction || isIframe || isProjectDevHost || isEditorHost ||
    (isKnownPreviewDomain && isPreviewLabel) || new URLSearchParams(search).get("sw") === "off";
}
