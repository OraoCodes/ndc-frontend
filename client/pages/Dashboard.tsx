import { MainLayout } from "@/components/MainLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const chartData = [
  { name: "Q1", value: 65 },
  { name: "Q2", value: 45 },
  { name: "Q3", value: 55 },
  { name: "Q4", value: 75 },
];

export default function Index() {
  const { data: counties } = useQuery({ queryKey: ["counties"], queryFn: api.listCounties });
  const { data: thematicAreas } = useQuery({ queryKey: ["thematicAreas"], queryFn: api.listThematicAreas });
  const { data: publications } = useQuery({ queryKey: ["publications"], queryFn: api.listPublications });

  const totalCounties = counties ? counties.length : "—";
  const totalThematic = thematicAreas ? thematicAreas.length : "—";

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to NDC Dashboard</h2>
          <p className="text-muted-foreground">Track water and waste management performance across Kenya</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-6 border border-border">
              <p className="text-xs text-muted-foreground mb-2">Total Counties</p>
              <p className="text-3xl font-bold text-foreground">{totalCounties}</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-border">
              <p className="text-xs text-muted-foreground mb-2">Thematic Areas</p>
              <p className="text-3xl font-bold text-primary">{totalThematic}</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-border">
              <p className="text-xs text-muted-foreground mb-2">Water Management</p>
              <p className="text-3xl font-bold text-primary">85%</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-border">
              <p className="text-xs text-muted-foreground mb-2">Overall Score</p>
              <p className="text-3xl font-bold text-foreground">79%</p>
            </div>
          </div>

          {/* Overview Chart */}
          <div className="bg-white rounded-lg p-6 border border-border">
            <h3 className="text-sm font-semibold text-foreground mb-6">Quarterly Performance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [value, "Score"]} />
                <Bar dataKey="value" fill="#4cd9c0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Navigation Cards */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-4">Quick Access</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/counties" className="bg-white rounded-lg p-6 border border-border hover:border-primary hover:bg-background/50 transition-colors cursor-pointer">
              <h3 className="font-semibold text-foreground mb-2">County Rankings</h3>
              <p className="text-xs text-muted-foreground">View water and waste management rankings by county</p>
            </a>
            <a href="/thematic-areas" className="bg-white rounded-lg p-6 border border-border hover:border-primary hover:bg-background/50 transition-colors cursor-pointer">
              <h3 className="font-semibold text-foreground mb-2">Thematic Areas</h3>
              <p className="text-xs text-muted-foreground">Explore performance across different thematic areas</p>
            </a>
            <a href="/indicators" className="bg-white rounded-lg p-6 border border-border hover:border-primary hover:bg-background/50 transition-colors cursor-pointer">
              <h3 className="font-semibold text-foreground mb-2">Indicators</h3>
              <p className="text-xs text-muted-foreground">Review detailed performance indicators and metrics</p>
            </a>
          </div>
        </div>
        {/* Recent Publications */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-4">Recent Publications</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(publications ?? []).slice(0, 6).map((p: any) => (
              <div key={p.id} className="bg-white rounded-lg p-4 border border-border flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-foreground mb-1 truncate">{p.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{p.filename} • {p.date ? new Date(p.date).toLocaleDateString() : "—"}</p>
                  <p className="text-sm text-foreground/90 line-clamp-2">{p.summary}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={async () => {
                      try {
                        const blob = await api.downloadPublication(p.id);
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = p.filename ?? `publication-${p.id}`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded bg-background text-foreground text-sm border border-border hover:bg-background/80"
                  >
                    Download
                  </button>
                  <span className="text-xs text-muted-foreground">PDF</span>
                </div>
              </div>
            ))}
            {(publications ?? []).length === 0 && (
              <div className="col-span-full text-sm text-muted-foreground">No publications yet. Upload one from the Publications page.</div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
