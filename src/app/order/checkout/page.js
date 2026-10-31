import CheckoutView from "@/components/CheckoutView";

export const metadata = {
  title: "Vaša porudžbina",
  description: "Pregled korpe i slanje zahtjeva za preuzimanje u Tuzima.",
};

export default function Checkout() {
  return (
    <main>
      <CheckoutView />
    </main>
  );
}
