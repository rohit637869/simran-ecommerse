"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit, Trash2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { getBrandsList, createBrand, updateBrand, deleteBrand } from "@/app/actions/brands";
import ImageUpload from "@/components/admin/ImageUpload";
import { toast } from "sonner";

interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  isActive: boolean | null;
  createdAt: Date;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [logoImages, setLogoImages] = useState<{ url: string; publicId?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setBrands(await getBrandsList(search || undefined) as Brand[]); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetch(); }, [fetch]);

  const resetForm = () => {
    setName(""); setSlug(""); setDescription(""); setLogoImages([]);
    setEditing(null); setShowForm(false);
  };

  const handleEdit = (b: Brand) => {
    setEditing(b);
    setName(b.name); setSlug(b.slug); setDescription(b.description || "");
    setLogoImages(b.logoUrl ? [{ url: b.logoUrl }] : []);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!name) { toast.error("Name is required"); return; }
    const logoUrl = logoImages.length > 0 ? logoImages[0].url : undefined;
    try {
      if (editing) {
        await updateBrand(editing.id, { name, slug: slug || undefined, description: description || undefined, logoUrl });
        toast.success("Brand updated");
      } else {
        await createBrand({ name, slug: slug || undefined, description: description || undefined, logoUrl });
        toast.success("Brand created");
      }
      resetForm(); fetch();
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Failed"); }
  };

  const handleDelete = async (id: number) => {
    try { await deleteBrand(id); toast.success("Brand deleted"); fetch(); }
    catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Brands</h2>
          <p className="text-sm text-muted-foreground">{brands.length} brands</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}><Plus className="mr-2 h-4 w-4" /> Add Brand</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editing ? "Edit" : "New"} Brand</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug</label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Auto if empty" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea className="flex min-h-[60px] w-full rounded border border-input bg-transparent px-3 py-2 text-sm" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Logo</label>
              <ImageUpload images={logoImages} onChange={setLogoImages} maxImages={1} />
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
            <Input placeholder="Search brands..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b text-xs uppercase text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Logo</th>
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
              ) : brands.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">No brands yet</td></tr>
              ) : brands.map((b) => (
                <tr key={b.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3">
                    {b.logoUrl ? (
                      <img src={b.logoUrl} alt={b.name} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        {b.name.charAt(0)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{b.name}</td>
                  <td className="px-4 py-3 text-sm"><code className="rounded bg-muted px-1.5 py-0.5 text-xs">{b.slug}</code></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">{b.description || "—"}</td>
                  <td className="px-4 py-3 text-center"><Badge variant={b.isActive ? "default" : "secondary"}>{b.isActive ? "Active" : "Inactive"}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(b)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
