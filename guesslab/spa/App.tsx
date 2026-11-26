import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import Dashboard from "@/app/page";
import LibraryPage from "@/app/library/page";
import PracticeIndex from "@/app/practice/page";
import SchoolPage from "@/app/school/page";
import KnowledgePage from "@/app/knowledge/page";
import PerformancePage from "@/app/performance/page";
import { Workspace } from "@/components/workspace/Workspace";
import { Arena } from "@/components/practice/Arena";
import { Interviewer } from "@/components/interview/Interviewer";
import { ModuleView } from "@/components/school/ModuleView";
import { getGuesstimate } from "@/content/guesstimates";
import { getPractice } from "@/content/practice";
import { SCHOOL } from "@/content/school";
import { useHash } from "./shims/navigation";
import { hashToPath } from "./route";

function NotFound() {
  return (
    <div className="mx-auto grid max-w-lg gap-3 px-4 py-20 text-center">
      <p className="eyebrow">Not found</p>
      <h1 className="font-serif text-3xl font-semibold">That page isn't here</h1>
      <a href="#library" className="font-medium text-accent hover:underline">
        Browse the guesstimate library
      </a>
    </div>
  );
}

function Route({ path }: { path: string }) {
  const [, section, id] = path.split("/");
  switch (section) {
    case undefined:
    case "":
      return <Dashboard />;
    case "library":
      return <LibraryPage />;
    case "practice": {
      if (!id) return <PracticeIndex />;
      const p = getPractice(id);
      return p ? <Arena key={id} problem={p} /> : <NotFound />;
    }
    case "learn": {
      const g = id ? getGuesstimate(id) : undefined;
      return g ? <Workspace key={id} problem={g} /> : <NotFound />;
    }
    case "interview":
      return <Interviewer />;
    case "school": {
      if (!id) return <SchoolPage />;
      const m = SCHOOL.find((x) => x.id === id);
      return m ? <ModuleView key={id} module={m} /> : <NotFound />;
    }
    case "knowledge":
      return <KnowledgePage />;
    case "performance":
      return <PerformancePage />;
    default:
      return <NotFound />;
  }
}

export function App() {
  const hash = useHash();
  const { path, section } = hashToPath(hash);
  useEffect(() => {
    if (section) requestAnimationFrame(() => document.getElementById(section)?.scrollIntoView({ behavior: "smooth" }));
    else window.scrollTo({ top: 0 });
  }, [path, section]);
  const title = path === "/" ? "GuessLab" : `${path.split("/")[1].replace(/^./, (c) => c.toUpperCase())} · GuessLab`;
  useEffect(() => void (document.title = title), [title]);
  return (
    <AppShell>
      <Route path={path} />
    </AppShell>
  );
}
