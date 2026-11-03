import "server-only";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { addDays, todayInPodgorica } from "@/lib/date";
import { ORDER_STATUSES, STATUS_TRANSITIONS } from "@/data/orders";
import Order from "@/models/Order";

const MAX_RESULTS = 200;
const ACTIVE_STATUSES = ["new", "confirmed", "ready"];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export class OrderAdminError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Gotovi pregledi na admin stranici, preko istih filtera kao API.
export function viewFilters(view) {
  const today = todayInPodgorica();
  switch (view) {
    // Dan prikazuje i preuzete narudžbe, da se vidi cio dan; otkazane su samo u "Sve".
    case "today":
      return { date: today, status: [...ACTIVE_STATUSES, "completed"] };
    case "tomorrow":
      return { date: addDays(today, 1), status: [...ACTIVE_STATUSES, "completed"] };
    case "new":
      return { status: ["new"] };
    case "upcoming":
      return { from: today, status: ACTIVE_STATUSES };
    default:
      return {};
  }
}

// Filteri iz URL-a: ?status=new,confirmed&date=2026-11-05&from=2026-11-01&to=2026-11-30
export function parseOrderFilters(searchParams) {
  const filters = {};
  const status = searchParams.get("status");
  if (status) {
    filters.status = status.split(",").filter((value) => Object.hasOwn(ORDER_STATUSES, value));
    if (filters.status.length === 0) throw new OrderAdminError(400, "Nepoznat status");
  }
  for (const key of ["date", "from", "to"]) {
    const value = searchParams.get(key);
    if (value && !ISO_DATE.test(value)) throw new OrderAdminError(400, `Datum "${key}" mora biti u obliku YYYY-MM-DD`);
    if (value) filters[key] = value;
  }
  return filters;
}

// Narudžbe po datumu i terminu preuzimanja; za "nove" bez datuma prve su najstarije.
export async function listOrders({ status, date, from, to } = {}) {
  const query = {};
  if (status?.length) query.status = { $in: status };
  if (date) query.pickupDate = date;
  else if (from || to) query.pickupDate = { ...(from && { $gte: from }), ...(to && { $lte: to }) };

  await connectDB();
  return Order.find(query).sort({ pickupDate: 1, pickupTime: 1, createdAt: 1 }).limit(MAX_RESULTS).lean();
}

export async function countNewOrders() {
  await connectDB();
  return Order.countDocuments({ status: "new" });
}

export async function findOrder(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  return Order.findById(id).lean();
}

// Mijenja status samo ako je prelaz dozvoljen iz trenutnog statusa. Provjera i izmjena su jedan upit,
// pa ako dva radnika kliknu istovremeno, drugi dobija grešku umjesto da pregazi prvog.
export async function updateOrderStatus(id, status, user) {
  if (!Object.hasOwn(ORDER_STATUSES, status)) throw new OrderAdminError(400, "Nepoznat status");
  if (!mongoose.isValidObjectId(id)) throw new OrderAdminError(404, "Narudžba ne postoji");

  const allowedFrom = Object.keys(STATUS_TRANSITIONS).filter((from) => STATUS_TRANSITIONS[from].includes(status));

  await connectDB();
  const order = await Order.findOneAndUpdate(
    { _id: id, status: { $in: allowedFrom } },
    { $set: { status }, $push: { history: { status, by: user._id, byName: user.name, at: new Date() } } },
    { returnDocument: "after" },
  ).lean();

  if (order) return order;

  const current = await Order.findById(id).select("status").lean();
  if (!current) throw new OrderAdminError(404, "Narudžba ne postoji");
  throw new OrderAdminError(
    409,
    `Narudžba je trenutno "${ORDER_STATUSES[current.status]}" i ne može preći u "${ORDER_STATUSES[status]}". Osvježite stranicu.`,
  );
}
