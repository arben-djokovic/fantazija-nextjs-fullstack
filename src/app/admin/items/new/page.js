import { Suspense } from "react";
import { requirePageUser } from "@/lib/auth";
import AdminHeader from "@/components/admin/AdminHeader";
import ItemForm from "@/components/admin/ItemForm";

async function NewItem() {
  const user = await requirePageUser(["admin"]);

  return (
    <>
      <AdminHeader user={user} />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10">
        <h1 className="font-serif text-4xl text-ink">Novi proizvod</h1>
        <ItemForm />
      </div>
    </>
  );
}

export default function NewItemPage() {
  return (
    <main>
      <Suspense fallback={null}>
        <NewItem />
      </Suspense>
    </main>
  );
}
