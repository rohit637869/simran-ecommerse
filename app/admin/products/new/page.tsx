"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, Plus, Trash2, Package, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import ImageUpload from "@/components/admin/ImageUpload";
import { createProduct, saveProductImages, createProductVariant, getFormOptions } from "@/app/actions/products";
import { createBrand } from "@/app/actions/brands";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

interface FormOption {
  id: number;
  name: string;
}

interface VariantEntry {
  key: string;
  size: string;
  colorName: string;
  colorHex: string;
  fit: string;
  materialCode: string;
  additionalPrice: string;
  stockQuantity: number;
  lowStockThreshold: number;
  imageUrl: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    getFormOptions().then((opts) => {
      setBrands(opts.brands);
      setCategories(opts.categories);
      setCollections(opts.collections);
    });
  }, []);

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
      imageUrl: "",
    }]);
  };

  const removeVariant = (key: string) => {
    setVariants(variants.filter((v) => v.key !== key));
  };

  const updateVariant = (key: string, field: keyof VariantEntry, value: string | number | boolean) => {
    setVariants(variants.map((v) => v.key === key ? { ...v, [field]: value } : v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !name || !basePrice) {
      toast.error("SKU, Name, and Base Price are required");
      return;
    }

    setLoading(true);
    try {
      const product = await createProduct({
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

      if (images.length > 0) {
        await saveProductImages(product.id, images.map((img) => img.url));
      }

      for (const v of variants) {
        await createProductVariant({
          productId: product.id,
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

      toast.success("Product created");
      router.push(`/admin/products/${product.id}`);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

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
            <h2 className="text-2xl font-bold tracking-tight">New Product</h2>
            <p className="text-sm text-muted-foreground">Add a new product to your store</p>
          </div>
        </div>
        <Button type="submit" disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Saving..." : "Save Product"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>Upload product images</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload images={images} onChange={setImages} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Product name, description, and details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value.replace(/\s+/g, "-"))} placeholder="Auto-generated if empty" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="flex min-h-[80px] w-full rounded border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="designStory">Design Story</Label>
                  <textarea
                    id="designStory"
                    className="flex min-h-[80px] w-full rounded border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    value={designStory}
                    onChange={(e) => setDesignStory(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="materials">Materials</Label>
                  <textarea
                    id="materials"
                    className="flex min-h-[80px] w-full rounded border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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
              <CardDescription>Add size, color, and stock variants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {variants.map((v, i) => (
                <div key={v.key} className="rounded border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Variant {i + 1}</span>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(v.key)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Size</Label>
                      <Input value={v.size} onChange={(e) => updateVariant(v.key, "size", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Color Name</Label>
                      <Input value={v.colorName} onChange={(e) => updateVariant(v.key, "colorName", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Color Hex</Label>
                      <div className="flex gap-2">
                        <Input type="color" className="w-12 h-9 p-1" value={v.colorHex} onChange={(e) => updateVariant(v.key, "colorHex", e.target.value)} />
                        <Input value={v.colorHex} onChange={(e) => updateVariant(v.key, "colorHex", e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Fit</Label>
                      <Input value={v.fit} onChange={(e) => updateVariant(v.key, "fit", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Material Code</Label>
                      <Input value={v.materialCode} onChange={(e) => updateVariant(v.key, "materialCode", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Add. Price</Label>
                      <Input value={v.additionalPrice} onChange={(e) => updateVariant(v.key, "additionalPrice", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Stock</Label>
                      <Input type="number" value={v.stockQuantity} onChange={(e) => updateVariant(v.key, "stockQuantity", Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Low Stock Threshold</Label>
                      <Input type="number" value={v.lowStockThreshold} onChange={(e) => updateVariant(v.key, "lowStockThreshold", Number(e.target.value))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Variant Image</Label>
                      <div className="flex items-center gap-2">
                        {v.imageUrl ? (
                          <div className="relative group h-9 w-9 rounded overflow-hidden border shrink-0">
                            <img src={v.imageUrl} alt="" className="h-full w-full object-cover" />
                            <button type="button" onClick={() => updateVariant(v.key, "imageUrl", "")} className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/50"><X className="h-3 w-3 text-white" /></button>
                          </div>
                        ) : null}
                        <label className="cursor-pointer text-xs text-primary hover:underline">
                          {v.imageUrl ? "Change" : "Upload"}
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const fd = new FormData();
                            fd.append("file", file);
                            fd.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
                            const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!}/image/upload`, { method: "POST", body: fd });
                            const data = await res.json();
                            if (res.ok) updateVariant(v.key, "imageUrl", data.secure_url);
                            e.target.value = "";
                          }} />
                        </label>
                      </div>
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
            <CardHeader>
              <CardTitle>Organization</CardTitle>
              <CardDescription>Categorize this product</CardDescription>
            </CardHeader>
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
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>Set product pricing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price *</Label>
                <Input id="basePrice" type="number" step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price</Label>
                <Input id="costPrice" type="number" step="0.01" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weightKg">Weight (kg)</Label>
                <Input id="weightKg" type="number" step="0.001" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
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
                <span className="text-sm">Digital Product</span>
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
