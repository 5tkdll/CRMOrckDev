export function readCompanySaveResult(value) {
  if (!value || typeof value !== "object") throw new Error("INVALID_SAVE_RESULT");
  if (value.ok === true && typeof value.id === "string" && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value.id)) return { ok: true, id: value.id };
  if (value.ok === false && value.state && typeof value.state === "object" && typeof value.state.message === "string") return { ok: false, state: value.state };
  throw new Error("INVALID_SAVE_RESULT");
}
