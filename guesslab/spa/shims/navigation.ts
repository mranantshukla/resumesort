import { useSyncExternalStore } from "react";
import { hashToPath } from "../route";

// Stand-in for next/navigation in the static build, driven by location.hash.
const subscribe = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const getHash = () => window.location.hash;

export function useHash(): string {
  return useSyncExternalStore(subscribe, getHash, () => "");
}
export function usePathname(): string {
  return hashToPath(useHash()).path;
}
export function useSearchParams(): URLSearchParams {
  return hashToPath(useHash()).params;
}
export function useRouter() {
  return { push: (h: string) => (window.location.hash = h), replace: (h: string) => (window.location.hash = h), back: () => history.back() };
}
export function notFound(): never {
  throw new Error("not found");
}
