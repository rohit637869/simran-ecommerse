"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, Plus, Trash2, Package, Loader2, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ImageUpload from "@/components/admin/ImageUpload";
import {
  getProduct, updateProduct, getFormOptions, saveProductImages,
  createProductVariant, updateProductVariant, deleteProductVariant,
} from "@/app/actions/products";
import { createBrand } from "@/app/actions/brands";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

interface FormOption { id: number; name: string; }

interface ImageItem { imageUrl: string }

interface VariantItem {
  id: number;
  size: string | null;
  colorName: string | null;
  colorHex: string | null;
  fit: string | null;
  materialCode: string | null;
  additionalPrice: string | null;
  stockQuantity: number;
  lowStockThreshold: number | null;
  isActive: boolean | null;
  imageUrl: string | null;
}

interface VariantEntry {
  id?: number;
  key: string;
  size: string;
  colorName: string;
  colorHex: string;
  fit: string;
  materialCode: string;
  additionalPrice: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  imageUrl: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [brands, setBrands] = useState<FormOption[]>([]);
  const [categories, setCategories] = useState<FormOption[]>([]);
  const [collections, setCollections] = useState<FormOption[]>([]);

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [designStory, setDesignStory] = useState("");
  const [materials, setMaterials] = useState("");
  const [brandId, setBrandId] = useState("");
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandSlug, setNewBrandSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isCustomizable, setIsCustomizable] = useState(false);
  const [isDigital, setIsDigital] = useState(false);
  const [images, setImages] = useState<{ url: string; publicId?: string }[]>([]);
  const [variants, setVariants] = useState<VariantEntry[]>([]);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      getProduct(productId),
      getFormOptions(),
    ]).then(([product, opts]) => {
      if (ignore) return;
      if (!product) {
        toast.error("Product not found");
        router.push("/admin/products");
        return;
      }
      setBrands(opts.brands);
      setCategories(opts.categories);
      setCollections(opts.collections);

      setSku(product.sku);
      setName(product.name);
      setSlug(product.slug);
      setDescription(product.description || "");
      setDesignStory(product.designStory || "");
      setMaterials(product.materials || "");
      setBrandId(product.brandId ? String(product.brandId) : "");
      setCategoryId(product.categoryId ? String(product.categoryId) : "");
      setCollectionId(product.collectionId ? String(product.collectionId) : "");
      setBasePrice(product.basePrice);
      setCostPrice(product.costPrice || "");
      setWeightKg(product.weightKg || "");
      setIsActive(product.isActive ?? true);
      setIsCustomizable(product.isCustomizable ?? false);
      setIsDigital(product.isDigital ?? false);

      setImages(product.images.map((img: ImageItem) => ({ url: img.imageUrl })));

      setVariants(product.variants.map((v: VariantItem) => ({
        id: v.id,
        key: Math.random().toString(36).slice(2),
        size: v.size || "",
        colorName: v.colorName || "",
        colorHex: v.colorHex || "#000000",
        fit: v.fit || "",
        materialCode: v.materialCode || "",
        additionalPrice: v.additionalPrice || "0",
        stockQuantity: v.stockQuantity ?? 0,
        lowStockThreshold: v.lowStockThreshold ?? 5,
        isActive: v.isActive ?? true,
        imageUrl: v.imageUrl || "",
      })));

      setLoading(false);
    }).catch(() => {
      if (!ignore) setLoading(false);
    });
    return () => { ignore = true; };
  }, [productId, router]);

  const addVariant = () => {
    setVariants([...variants, {
      key: Math.random().toString(36).slice(2),
      size: "",
      colorName: "",
      colorHex: "#000000",
      fit: "",
      materialCode: "",
      additionalPrice: "0",
      stockQuantity: 0,
      lowStockThreshold: 5,
      isActive: true,
      imageUrl: "",
    }]);
  };

  const removeVariant = async (v: VariantEntry) => {
    if (v.id) {
      await deleteProductVariant(v.id);
    }
    setVariants(variants.filter((x) => x.key !== v.key));
  };

  const updateVariantField = (key: string, field: keyof VariantEntry, value: string | number | boolean) => {
    setVariants(variants.map((v) => v.key === key ? { ...v, [field]: value } : v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !name || !basePrice) {
      toast.error("SKU, Name, and Base Price are required");
      return;
    }

    setSaving(true);
    try {
      await updateProduct(productId, {
        sku,
        name,
        slug: slug || undefined,
        description: description || undefined,
        designStory: designStory || undefined,
        materials: materials || undefined,
        brandId: brandId ? Number(brandId) : null,
        categoryId: categoryId ? Number(categoryId) : null,
        collectionId: collectionId ? Number(collectionId) : null,
        basePrice,
        costPrice: costPrice || undefined,
        weightKg: weightKg || undefined,
        isActive,
        isCustomizable,
        isDigital,
      });

      await saveProductImages(productId, images.map((img) => img.url));

      for (const v of variants) {
        if (v.id) {
          await updateProductVariant(v.id, {
            size: v.size || undefined,
            colorName: v.colorName || undefined,
            colorHex: v.colorHex || undefined,
            fit: v.fit || undefined,
            materialCode: v.materialCode || undefined,
            additionalPrice: v.additionalPrice || "0",
            stockQuantity: v.stockQuantity,
            lowStockThreshold: v.lowStockThreshold,
            isActive: v.isActive,
            imageUrl: v.imageUrl || undefined,
          });
        } else {
          await createProductVariant({
            productId,
            size: v.size || undefined,
            colorName: v.colorName || undefined,
            colorHex: v.colorHex || undefined,
            fit: v.fit || undefined,
            materialCode: v.materialCode || undefined,
            additionalPrice: v.additionalPrice || "0",
            stockQuantity: v.stockQuantity,
            lowStockThreshold: v.lowStockThreshold,
            imageUrl: v.imageUrl || undefined,
          });
        }
      }

      toast.success("Product updated");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Edit Product</h2>
            <p className="text-sm text-muted-foreground">{sku}</p>
          </div>
        </div>
        <Button type="submit" disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload images={images} onChange={setImages} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Product Name *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>SKU *</Label>
                  <Input value={sku} onChange={(e) => setSku(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value.replace(/\s+/g, "-"))} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <textarea
                  className="flex min-h-[80px] w-full rounded border border-input bg-transparent px-3 py-2 text-sm"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Design Story</Label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded border border-input bg-transparent px-3 py-2 text-sm"
                    value={designStory}
                    onChange={(e) => setDesignStory(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Materials</Label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded border border-input bg-transparent px-3 py-2 text-sm"
                    value={materials}
                    onChange={(e) => setMaterials(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {variants.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No variants yet. Add one below.
                </p>
              )}
              {variants.map((v, i) => (
                <div key={v.key} className="rounded border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Variant {i + 1}</span>
                      {v.id && <Badge variant="outline" className="text-xs">Saved</Badge>}
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(v)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Size</Label>
                      <Input value={v.size} onChange={(e) => updateVariantField(v.key, "size", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Color Name</Label>
                      <Input value={v.colorName} onChange={(e) => updateVariantField(v.key, "colorName", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Color</Label>
                      <div className="flex gap-2">
                        <Input type="color" className="w-12 h-9 p-1" value={v.colorHex} onChange={(e) => updateVariantField(v.key, "colorHex", e.target.value)} />
                        <Input value={v.colorHex} onChange={(e) => updateVariantField(v.key, "colorHex", e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Fit</Label>
                      <Input value={v.fit} onChange={(e) => updateVariantField(v.key, "fit", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Material</Label>
                      <Input value={v.materialCode} onChange={(e) => updateVariantField(v.key, "materialCode", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Add. Price</Label>
                      <Input value={v.additionalPrice} onChange={(e) => updateVariantField(v.key, "additionalPrice", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Stock</Label>
                      <Input type="number" value={v.stockQuantity} onChange={(e) => updateVariantField(v.key, "stockQuantity", Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={v.isActive} onChange={(e) => updateVariantField(v.key, "isActive", e.target.checked)} />
                      Active
                    </label>
                    <div className="flex items-center gap-2">
                      {v.imageUrl ? (
                        <div className="relative group h-9 w-9 rounded overflow-hidden border shrink-0">
                          <img src={v.imageUrl} alt="" className="h-full w-full object-cover" />
                          <button type="button" onClick={() => updateVariantField(v.key, "imageUrl", "")} className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/50"><X className="h-3 w-3 text-white" /></button>
                        </div>
                      ) : null}
                      <label className="cursor-pointer text-xs text-primary hover:underline">
                        {v.imageUrl ? "Change Image" : "Add Image"}
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0]; if (!file) return;
                          const fd = new FormData(); fd.append("file", file);
                          fd.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
                          const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!}/image/upload`, { method: "POST", body: fd });
                          const data = await res.json(); if (res.ok) updateVariantField(v.key, "imageUrl", data.secure_url);
                          e.target.value = "";
                        }} />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addVariant}>
                <Plus className="mr-2 h-4 w-4" /> Add Variant
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Brand</Label>
                <div className="flex gap-2">
                  <Select value={brandId} onValueChange={setBrandId}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="No brand" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No brand</SelectItem>
                      {brands.map((b) => (
                        <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" size="icon" onClick={() => setBrandDialogOpen(true)}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue placeholder="No category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No category</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Collection</Label>
                <Select value={collectionId} onValueChange={setCollectionId}>
                  <SelectTrigger><SelectValue placeholder="No collection" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No collection</SelectItem>
                    {collections.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Base Price *</Label>
                <Input type="number" step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Cost Price</Label>
                <Input type="number" step="0.01" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" step="0.001" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Status</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4" />
                <span className="text-sm">Active</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={isCustomizable} onChange={(e) => setIsCustomizable(e.target.checked)} className="h-4 w-4" />
                <span className="text-sm">Customizable</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={isDigital} onChange={(e) => setIsDigital(e.target.checked)} className="h-4 w-4" />
                <span className="text-sm">Digital</span>
              </label>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>

    <Dialog open={brandDialogOpen} onOpenChange={setBrandDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Brand</DialogTitle>
          <DialogDescription>Create a new brand</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input value={newBrandSlug} onChange={(e) => setNewBrandSlug(e.target.value)} placeholder="Auto if empty" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setBrandDialogOpen(false)}>Cancel</Button>
          <Button onClick={async () => {
            if (!newBrandName) { toast.error("Name is required"); return; }
            try {
              const created = await createBrand({ name: newBrandName, slug: newBrandSlug || undefined });
              setBrands([...brands, { id: created.id, name: created.name }]);
              setBrandId(String(created.id));
              setNewBrandName(""); setNewBrandSlug("");
              setBrandDialogOpen(false);
              toast.success("Brand created");
            } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Failed"); }
          }}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
