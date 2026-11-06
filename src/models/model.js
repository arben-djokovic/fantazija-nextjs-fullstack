import mongoose from "mongoose";

// Registruje model samo jednom, jer Next isti fajl učitava više puta.
// U dev modu se model pravi ponovo iz trenutne šeme: inače posle izmjene šeme ostaje stari model
// iz memorije, koji tiho izbacuje nova polja pri čuvanju, dok se server ne restartuje.
export function defineModel(name, schema) {
  if (mongoose.models[name]) {
    if (process.env.NODE_ENV === "production") return mongoose.models[name];
    mongoose.deleteModel(name);
  }
  return mongoose.model(name, schema);
}
