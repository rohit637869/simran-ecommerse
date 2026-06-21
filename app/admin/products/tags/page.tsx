"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, Edit, Trash2, Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { getTags, createTag, updateTag, deleteTag } from "@/app/actions/tags";
import { toast } from "sonner";

interface TagItem {
  id: number;
  name: string;
  slug: string;
}

export default function TagsPage() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TagItem | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const result = await getTags(search || undefined);
      setTags(result.tags as TagItem[]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { setLoading(true); fetch(); }, [fetch]);

  const resetForm = () => { setName(""); setEditing(null); setShowForm(false); };

  const handleEdit = (tag: TagItem) => {
    setEditing(tag); setName(tag.name); setShowForm(true);
  };

  const handleSave = async () => {
    if (!name) { toast.error("Name is required"); return; }
    try {
      if (editing) {
        await updateTag(editing.id, { name });
        toast.success("Tag updated");
      } else {
        await createTag(name);
        toast.success("Tag created");
      }
      resetForm(); fetch();
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Failed to save"); }
  };

  const handleDelete = async (id: number) => {
    try { await deleteTag(id); toast.success("Tag deleted"); fetch(); }
    catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tags</h2>
          <p className="text-sm text-muted-foreground">{tags.length} tags</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Tag
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editing ? "Edit" : "New"} Tag</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search tags..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b text-xs uppercase text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Slug</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</td></tr>
              ) : tags.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-muted-foreground">No tags yet</td></tr>
              ) : tags.map((tag) => (
                <tr key={tag.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm font-medium">{tag.name}</td>
                  <td className="px-4 py-3 text-sm"><code className="rounded bg-muted px-1.5 py-0.5 text-xs">{tag.slug}</code></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(tag)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(tag.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
