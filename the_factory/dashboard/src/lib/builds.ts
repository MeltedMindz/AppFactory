export interface BuildEntry {
  buildId: string;
  name: string;
  slug: string;
  origin: {
    mode: 'pipeline' | 'dream';
    runId: string | null;
    ideaSlug: string | null;
    dreamPromptHash: string | null;
  };
  framework: string;
  buildPath: string;
  status: 'success' | 'failed';
  createdAt: string;
  launch: {
    type: string;
    recommended: string;
    notes: string;
  };
  preview: {
    enabled: boolean;
    instructions: string[];
  };
}

export interface BuildsData {
  updatedAt: string;
  builds: BuildEntry[];
}

export async function loadBuilds(): Promise<BuildsData> {
  const response = await fetch('/builds.json');
  if (!response.ok) {
    throw new Error(`Failed to load builds data: ${response.statusText}`);
  }
  return response.json();
}

export function filterBuilds(
  builds: BuildEntry[],
  searchTerm: string,
  modeFilter: string,
  statusFilter: string
): BuildEntry[] {
  return builds.filter(build => {
    const matchesSearch = !searchTerm || 
      build.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      build.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (build.origin.runId && build.origin.runId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (build.origin.ideaSlug && build.origin.ideaSlug.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMode = modeFilter === 'all' || build.origin.mode === modeFilter;
    const matchesStatus = statusFilter === 'all' || build.status === statusFilter;

    return matchesSearch && matchesMode && matchesStatus;
  });
}

export function sortBuilds(builds: BuildEntry[], sortBy: 'newest' | 'oldest'): BuildEntry[] {
  return [...builds].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });
}

export function calculateBuildStats(builds: BuildEntry[]) {
  const total = builds.length;
  const successful = builds.filter(b => b.status === 'success').length;
  const failed = builds.filter(b => b.status === 'failed').length;
  const dreamBuilds = builds.filter(b => b.origin.mode === 'dream').length;
  const pipelineBuilds = builds.filter(b => b.origin.mode === 'pipeline').length;

  return {
    total,
    successful,
    failed,
    dreamBuilds,
    pipelineBuilds,
    successRate: total > 0 ? Math.round((successful / total) * 100) : 0
  };
}

export function getUniqueBuildModes(builds: BuildEntry[]): string[] {
  const modes = new Set(builds.map(build => build.origin.mode));
  return Array.from(modes).sort();
}

export function getUniqueFrameworks(builds: BuildEntry[]): string[] {
  const frameworks = new Set(builds.map(build => build.framework));
  return Array.from(frameworks).sort();
}