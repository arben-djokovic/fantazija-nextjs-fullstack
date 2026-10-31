import CakeBuilder from "@/components/CakeBuilder";

export const metadata = {
  title: "Napravi svoju tortu",
  description: "Izaberite ukus, veličinu, dekoraciju i preuzimanje za vašu tortu.",
};

export default function CakeBuilderPage() {
  return (
    <main>
      <CakeBuilder />
    </main>
  );
}
