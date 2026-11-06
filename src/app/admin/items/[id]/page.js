import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requirePageUser } from "@/lib/auth";
import { findItem } from "@/lib/adminItems";
import AdminHeader from "@/components/admin/AdminHeader";
import ItemForm from "@/components/admin/ItemForm";
import { itemImages } from "@/lib/images";

// Proizvod iz baze u običan objekat za formu (ID-jevi kao tekst).
function toFormItem(item) {
  return {
    id: item._id.toString(),
    slug: item.slug,
    type: item.type,
    category: item.category ?? "classic",
    name: item.name,
    description: item.description,
    images: itemImages(item),
    badges: item.badges,
    options: item.options.map((option) => ({
      id: option._id.toString(),
      key: option.key,
      servings: option.servings ?? "",
      price: option.price,
      image: option.image ?? "",
    })),
    featured: item.featured,
    active: item.active,
    sortOrder: item.sortOrder,
  };
}

async function EditItem({ params }) {
  const user = await requirePageUser(["admin"]);
  const { id } = await params;
  const item = await findItem(id);
  if (!item) notFound();

  return (
    <>
      <AdminHeader user={user} />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10">
        <h1 className="font-serif text-4xl text-ink">{item.name.me}</h1>
        <ItemForm item={toFormItem(item)} />
      </div>
    </>
  );
}

export default function EditItemPage({ params }) {
  return (
    <main>
      <Suspense fallback={null}>
        <EditItem params={params} />
      </Suspense>
    </main>
  );
}
