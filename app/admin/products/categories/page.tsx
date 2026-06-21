"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, Edit, Trash2, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  getCategories, createCategory, updateCategory, deleteCategory,
} from "@/app/actions/categories";
import ImageUpload from "@/components/admin/ImageUpload";
import { toast } from "sonner";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  parentId: number | null;
  createdAt: Date;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const result = await getCategories(search || undefined);
      setCategories(result.categories as Category[]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { setLoading(true); fetch(); }, [fetch]);

  const resetForm = () => {
    setName("");
    setSlug("");
    setDescription("");
    setImageUrl("");
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setImageUrl(cat.imageUrl || "");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!name) { toast.error("Name is required"); return; }
    try {
      if (editing) {
        await updateCategory(editing.id, { name, slug: slug || undefined, description: description || undefined, imageUrl: imageUrl || undefined });
        toast.success("Category updated");
      } else {
        await createCategory({ name, slug: slug || undefined, description: description || undefined, imageUrl: imageUrl || undefined });
        toast.success("Category created");
      }
      resetForm();
      fetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory(id);
      toast.success("Category deleted");
      fetch();
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
          <p className="text-sm text-muted-foreground">{categories.length} categories</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editing ? "Edit" : "New"} Category</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug</label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value.replace(/\s+/g, "-"))} placeholder="Auto if empty" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="flex min-h-[60px] w-full rounded border border-input bg-transparent px-3 py-2 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Image</label>
              <ImageUpload
                images={imageUrl ? [{ url: imageUrl }] : []}
                onChange={(imgs) => setImageUrl(imgs[0]?.url || "")}
                maxImages={1}
              />
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
            <Input placeholder="Search categories..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b text-xs uppercase text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Image</th>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Slug</th>
                <th className="px-4 py-3 text-left font-medium">Description</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">No categories yet</td></tr>
              ) : categories.map((cat) => (
                <tr key={cat.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3">
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt="" className="h-10 w-10 rounded object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">—</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground"><code className="rounded bg-muted px-1.5 py-0.5 text-xs">{cat.slug}</code></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">{cat.description || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={cat.isActive ? "default" : "secondary"}>{cat.isActive ? "Active" : "Inactive"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
