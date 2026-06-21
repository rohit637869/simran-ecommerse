"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, Edit, Trash2, Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  getCollections, createCollection, updateCollection, deleteCollection, getBrands,
} from "@/app/actions/collections";
import ImageUpload from "@/components/admin/ImageUpload";
import { toast } from "sonner";

interface Collection {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  launchDate: string | null;
  isActive: boolean;
  brandName: string | null;
  brandId: number | null;
  createdAt: Date;
}

interface Brand { id: number; name: string; }

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [brandId, setBrandId] = useState("");
  const [launchDate, setLaunchDate] = useState("");
  const [coverImages, setCoverImages] = useState<{ url: string; publicId?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const [result, brandList] = await Promise.all([
        getCollections(search || undefined),
        getBrands(),
      ]);
      setCollections(result.collections as Collection[]);
      setBrands(brandList);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { setLoading(true); fetch(); }, [fetch]);

  const resetForm = () => {
    setName(""); setSlug(""); setDescription(""); setBrandId(""); setLaunchDate(""); setCoverImages([]);
    setEditing(null); setShowForm(false);
  };

  const handleEdit = (col: Collection) => {
    setEditing(col);
    setName(col.name); setSlug(col.slug); setDescription(col.description || "");
    setBrandId(col.brandId ? String(col.brandId) : "");
    setLaunchDate(col.launchDate ? col.launchDate.split("T")[0] : "");
    setCoverImages(col.coverImage ? [{ url: col.coverImage }] : []);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!name) { toast.error("Name is required"); return; }
    const coverImage = coverImages.length > 0 ? coverImages[0].url : undefined;
    try {
      if (editing) {
        await updateCollection(editing.id, {
          name, slug: slug || undefined, description: description || undefined,
          brandId: brandId ? Number(brandId) : null, launchDate: launchDate || undefined,
          coverImage,
        });
        toast.success("Collection updated");
      } else {
        await createCollection({
          name, slug: slug || undefined, description: description || undefined,
          brandId: brandId ? Number(brandId) : null, launchDate: launchDate || undefined,
          coverImage,
        });
        toast.success("Collection created");
      }
      resetForm(); fetch();
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Failed to save"); }
  };

  const handleDelete = async (id: number) => {
    try { await deleteCollection(id); toast.success("Collection deleted"); fetch(); }
    catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Collections</h2>
          <p className="text-sm text-muted-foreground">{collections.length} collections</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Collection
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editing ? "Edit" : "New"} Collection</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug</label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Brand</label>
                <Select value={brandId} onValueChange={setBrandId}>
                  <SelectTrigger><SelectValue placeholder="No brand" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No brand</SelectItem>
                    {brands.map((b) => (
                      <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Launch Date</label>
                <Input type="date" value={launchDate} onChange={(e) => setLaunchDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cover Image</label>
              <ImageUpload images={coverImages} onChange={setCoverImages} maxImages={1} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea className="flex min-h-[60px] w-full rounded border border-input bg-transparent px-3 py-2 text-sm" value={description} onChange={(e) => setDescription(e.target.value)} />
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
            <Input placeholder="Search collections..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b text-xs uppercase text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Cover</th>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Brand</th>
                <th className="px-4 py-3 text-left font-medium">Slug</th>
                <th className="px-4 py-3 text-left font-medium">Launch</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</td></tr>
              ) : collections.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">No collections yet</td></tr>
              ) : collections.map((col) => (
                <tr key={col.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3">
                    {col.coverImage ? (
                      <img src={col.coverImage} alt={col.name} className="h-10 w-14 rounded object-cover" />
                    ) : (
                      <div className="h-10 w-14 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        —
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{col.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{col.brandName || "—"}</td>
                  <td className="px-4 py-3 text-sm"><code className="rounded bg-muted px-1.5 py-0.5 text-xs">{col.slug}</code></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{col.launchDate ? new Date(col.launchDate).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={col.isActive ? "default" : "secondary"}>{col.isActive ? "Active" : "Inactive"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(col)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(col.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
