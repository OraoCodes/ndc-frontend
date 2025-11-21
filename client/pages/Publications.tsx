import { MainLayout } from "@/components/MainLayout";
import { Download } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";

export default function Publications() {
    const qc = useQueryClient();
    const { data: publications, isLoading } = useQuery({ queryKey: ["publications"], queryFn: api.listPublications });
    const [fileName, setFileName] = useState<string | null>(null);

    const uploadMutation = useMutation({
        mutationFn: api.createPublication,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["publications"] }),
    });

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFileName(f.name);

        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = (reader.result as string).split(",")[1];
            // Create a simple payload; you can add title/summary inputs later
            await uploadMutation.mutateAsync({ title: f.name, date: new Date().toISOString(), summary: "Uploaded file", filename: f.name, contentBase64: base64 });
        };
        reader.readAsDataURL(f);
    };

    const onDownload = async (id: number, filename?: string) => {
        try {
            const blob = await api.downloadPublication(id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename ?? `publication-${id}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Publications</h1>
                        <p className="text-sm text-muted-foreground mt-1">Research, reports and briefs about water & waste management.</p>
                    </div>
                    <div>
                        <label className="inline-flex items-center gap-2 px-3 py-2 rounded bg-background text-foreground text-sm border border-border hover:bg-background/80 cursor-pointer">
                            Upload file
                            <input type="file" className="hidden" onChange={onFileChange} />
                        </label>
                    </div>
                </div>

                <div>
                    {isLoading ? (
                        <p className="text-sm text-muted-foreground">Loading...</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(publications ?? []).map((p: any) => (
                                <div key={p.id} className="bg-white rounded-lg border border-border p-4 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">{p.title}</h3>
                                        <p className="text-xs text-muted-foreground mb-3">{new Date(p.date).toLocaleDateString()}</p>
                                        <p className="text-sm text-foreground/90">{p.summary}</p>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between">
                                        <button
                                            onClick={() => onDownload(p.id, p.filename)}
                                            className="inline-flex items-center gap-2 px-3 py-1 rounded bg-background text-foreground text-sm border border-border hover:bg-background/80"
                                        >
                                            <Download size={14} />
                                            Download
                                        </button>
                                        <span className="text-xs text-muted-foreground">{p.filename}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
