import mongoose from "mongoose";

// Nalozi za admin dio: vlasnik (admin) i radnici (staff). Kupci nemaju naloge.
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, minlength: 3, maxlength: 40 },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    passwordHash: { type: String, required: true, select: false }, // ne vraća se iz baze ako se ne traži izričito
    role: { type: String, enum: ["admin", "staff"], default: "staff" },
    active: { type: Boolean, default: true }, // deaktiviran radnik se ne može prijaviti
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
