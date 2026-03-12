"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";
import {
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  XCircle,
  Utensils,
  IndianRupee,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

type Category = {
  _id: string;
  name: string;
};

type Food = {
  _id: string;
  name: string;
  price: number;
  status: string;
  image_url: string | null;
  category_id:
    | {
        _id: string;
        name: string;
      }
    | null;
};

export default function FoodManagementPage() {
  const router = useRouter();

  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [newCategory, setNewCategory] = useState("");

useEffect(() => {
  Promise.all([fetchCategories(), fetchFoods()]);
}, []);

  /* ================= FETCH FOODS ================= */

  const fetchFoods = async () => {
    const res = await fetch("/api/foods");
    const data = await res.json();
    setFoods(data);
  };

  /* ================= FETCH CATEGORIES ================= */

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
  };

  /* ================= ADD CATEGORY ================= */

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCategory.trim()) return;

    await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newCategory }),
    });

    setNewCategory("");
    fetchCategories();
  };

  /* ================= DELETE CATEGORY ================= */

const deleteCategory = async (id: string) => {
  console.log("Deleting category:", id);

  if (!id) {
    alert("Category ID missing");
    return;
  }

  const res = await fetch(`/api/categories/${id}`, {
    method: "DELETE",
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Delete category failed:", data);
    alert(data.error || "Delete failed");
    return;
  }

  fetchCategories();
  fetchFoods();
};

  /* ================= ADD FOOD ================= */

  const addFood = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price) return;

    setIsUploading(true);

    let imageUrl: string | null = null;
    let publicId: string | null = null;

    if (imageFile) {
      const upload = await uploadToCloudinary(imageFile);
      imageUrl = upload.url;
      publicId = upload.public_id;
    }

    await fetch("/api/foods", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        price: Number(price),
        image_url: imageUrl,
        image_public_id: publicId,
        status: "available",
        category_id: categoryId,
      }),
    });

    setName("");
    setPrice("");
    setImageFile(null);
    setCategoryId("");

    setIsUploading(false);

    fetchFoods();
  };

  /* ================= TOGGLE STATUS ================= */

  const toggleStatus = async (food: Food) => {
    await fetch(`/api/foods/${food._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: food.status === "available" ? "unavailable" : "available",
      }),
    });

    fetchFoods();
  };

  /* ================= DELETE FOOD ================= */

  const deleteFood = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    await fetch(`/api/foods/${id}`, {
      method: "DELETE",
    });

    fetchFoods();
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 font-sans selection:bg-orange-500/30">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <Utensils className="w-5 h-5 text-orange-500" />
            <span className="text-xs font-bold tracking-[0.2em] text-orange-500 uppercase">
              Kitchen Catalog
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Menu Management
          </h1>
          <p className="text-slate-400 mt-2">
            Add new delicacies or update existing offerings.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Form Column */}
          <div className="lg:col-span-4">
           <div className="lg:sticky lg:top-8 bg-[#0F172A]/80 border border-white/5 backdrop-blur-2xl rounded-[2rem] p-8 shadow-2xl max-h-[calc(100vh-4rem)] lg:overflow-y-auto scrollbar-hide">
             {/* CATEGORY SECTION */}
<div className="pb-8 border-b border-white/5">
  <h2 className="text-lg font-bold text-white mb-4">
    Create Category
  </h2>

  <form onSubmit={addCategory} className="flex gap-3 mb-6">
    <input
      type="text"
      placeholder="e.g. Beverages"
      value={newCategory}
      onChange={(e) => setNewCategory(e.target.value)}
      className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
      required
    />
    <button className="px-5 rounded-xl bg-orange-600 hover:bg-orange-700 transition text-white text-sm font-semibold">
      Add
    </button>
  </form>

  {categories.length > 0 && (
    <>
      <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3 tracking-wider">
        Category List
      </h3>

      <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="flex justify-between items-center px-3 py-2 rounded-lg bg-white/3 hover:bg-white/5 transition text-sm"
          >
            <span className="text-slate-300">{cat.name}</span>
            <button
              onClick={() => deleteCategory(cat._id)}
              className="text-rose-500 hover:text-rose-400 text-xs"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </>
  )}
</div>

              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5" /> Add New Item
              </h2>
              <form onSubmit={addFood} className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase ml-1 mb-2 block">
                    Dish Name
                  </label>
                  <input
                    className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                    placeholder="e.g. Paneer Butter Masala"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase ml-1 mb-2 block">
                    Price (INR)
                  </label>

                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase ml-1 mb-2 block">
                    Category
                  </label>

                <select
  value={categoryId}
  onChange={(e) => setCategoryId(e.target.value)}
  required
  className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
>
  <option value="" className="bg-[#0F172A] text-white">
    Select Category
  </option>
  {categories.map((cat) => (
    <option key={cat._id} value={cat._id}
      className="bg-[#0F172A] text-white"
    >
      {cat.name}
    </option>
  ))}
</select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase ml-1 mb-2 block">
                    Food Image
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 hover:border-orange-500/50 transition-all group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {imageFile ? (
                        <p className="text-sm text-orange-400 font-medium">
                          {imageFile.name.substring(0, 20)}...
                        </p>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-slate-500 group-hover:text-orange-500 mb-2" />
                          <p className="text-xs text-slate-500 group-hover:text-slate-300">
                            PNG, JPG or WebP
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files && setImageFile(e.target.files[0])
                      }
                    />
                  </label>
                </div>

                <button
                  disabled={isUploading}
                  className="w-full rounded-2xl bg-gradient-to-r from-orange-600 to-rose-600 py-4 text-white font-bold shadow-lg shadow-orange-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Create Item"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Food Grid */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {foods.map((food) => (
                <div
                  key={food._id}
                  className="group relative bg-[#0F172A]/60 border border-white/5 rounded-[2rem] overflow-hidden hover:border-orange-500/30 transition-all duration-500"
                >
                  {/* Image Container */}
                  <div className="relative h-48 overflow-hidden">
                    {food.image_url ? (
                      <img
                        src={food.image_url}
                        alt={food.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-slate-700" />
                      </div>
                    )}
                    {/* Floating Badge */}
                    <div
                      className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border ${
                        food.status === "available"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/20 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {food.status}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">
                        {food.name}
                      </h3>

                      <p className="text-xs text-orange-400 mt-1">
                        {food.category_id?.name}
                      </p>

                      <p className="text-lg font-black text-white italic mt-2">
                        ₹{food.price}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 mt-6">
                      <button
                        onClick={() => toggleStatus(food)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition-all"
                      >
                        {food.status === "available" ? (
                          <>
                            <XCircle className="w-4 h-4 text-rose-500" /> Set
                            Unavailable
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />{" "}
                            Set Available
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => deleteFood(food._id)}
                        className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {foods.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-[2rem]">
                <Utensils className="w-12 h-12 text-slate-700 mb-4" />
                <p className="text-slate-500 font-medium text-lg">
                  Your menu is currently empty.
                </p>
                <p className="text-slate-600 text-sm">
                  Use the form on the left to add items.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
