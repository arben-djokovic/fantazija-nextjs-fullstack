import messages from "../../messages/me.json";
import { OPTION_KEYS } from "@/data/items";

const cakeText = messages.CakeBuilder;

// Naziv stavke, opcija i detalji custom torte, na crnogorskom (za admin).
export function describeItem(line) {
  if (line.kind === "item") {
    return { title: line.name.me, option: OPTION_KEYS[line.optionKey], details: [] };
  }

  const cake = line.custom;
  const details = [
    cake.photo && "jestiva slika",
    cake.fasting && "posna",
    cake.glutenFree && "bez glutena",
    cake.inscription && `natpis „${cake.inscription}”`,
    cake.wishes && `želje: ${cake.wishes}`,
    cake.idea && `ideja: ${cake.idea}`,
  ].filter(Boolean);

  return {
    title: cake.cakeType === "special" ? cakeText.specialCake : cakeText.flavours[cake.flavour],
    option: cake.size ? `${cakeText.sizes[cake.size].label}, po želji` : "po želji",
    details,
  };
}
