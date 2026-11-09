export const activeLeads = {
    NOT: { assessment: { startsWith: "DELETED:" } },
};

export const missingWebsite = {
    OR: [{ website: null }, { website: "" }],
};

export function parseLeadFilters(params) {
    const text = (key) => typeof params[key] === "string"
        ? params[key].slice(0, 200)
        : "";
    const legacy = text("group");
    const allowed = (value, options) => options.includes(value) ? value : "";
    const assessment = allowed(text("assessment"), ["POTENTIAL", "NO_INTEREST", "UNREVIEWED"])
        || (legacy === "potential" ? "POTENTIAL" : legacy === "no-interest" ? "NO_INTEREST" : "");
    const contact = allowed(text("contact"), ["blocked", "unblocked"])
        || (legacy === "blocked" ? "blocked" : "");
    const site = allowed(text("site"), ["missing", "present"])
        || (legacy === "no-website" ? "missing" : "");
    const requested = Number(text("page") || 1);

    return {
        q: text("q"),
        group: allowed(legacy, ["research", "phone", "deleted"]),
        assessment,
        contact,
        site,
        batch: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(text("batch"))
            ? text("batch")
            : "",
        segment: text("segment").slice(0, 120),
        page: Number.isInteger(requested) && requested > 0
            ? Math.min(requested, 100000)
            : 1,
    };
}

export function leadWhere(filters) {
    const conditions = [
        filters.group === "deleted"
            ? { assessment: { startsWith: "DELETED:" } }
            : activeLeads,
    ];

    if (filters.q) {
        conditions.push({ OR: [
            { name: { contains: filters.q, mode: "insensitive" } },
            { segment: { contains: filters.q, mode: "insensitive" } },
            { location: { contains: filters.q, mode: "insensitive" } },
            { phoneOriginal: { contains: filters.q } },
        ] });
    }
    if (filters.assessment === "UNREVIEWED") {
        const prefix = filters.group === "deleted" ? "DELETED:" : "";
        conditions.push({ assessment: { notIn: [prefix + "POTENTIAL", prefix + "NO_INTEREST"] } });
    } else if (filters.assessment) {
        conditions.push({ assessment: (filters.group === "deleted" ? "DELETED:" : "") + filters.assessment });
    }
    if (filters.contact) {
        conditions.push({ doNotContact: filters.contact === "blocked" });
    }
    if (filters.site === "missing") {
        conditions.push(missingWebsite);
    } else if (filters.site === "present") {
        conditions.push({ website: { not: null } }, { website: { not: "" } });
    }
    if (filters.group === "research") {
        conditions.push({ needsResearch: true });
    }
    if (filters.group === "phone") {
        conditions.push({ phoneNormalized: { not: null } }, { phoneNormalized: { not: "" } });
    }
    if (filters.batch) {
        conditions.push({ entry: { batchId: filters.batch } });
    }
    if (filters.segment) {
        conditions.push({ segment: { equals: filters.segment, mode: "insensitive" } });
    }
    return { AND: conditions };
}

export function leadUrl(filters, patch = {}) {
    const merged = { ...filters, ...patch };
    const query = new URLSearchParams();

    for (const key of ["q", "group", "assessment", "contact", "site", "batch", "segment", "page"]) {
        const value = merged[key];
        if (value !== "" && value !== undefined && value !== null) {
            query.set(key, String(value));
        }
    }
    return "/leads?" + query.toString();
}

export function restrictionPatch(raw, previous) {
    const has = (key) => Object.prototype.hasOwnProperty.call(raw, key);
    if (!has("doNotContact") && !has("doNotContactReason")) {
        return {
            doNotContact: previous.doNotContact,
            doNotContactReason: previous.doNotContactReason,
        };
    }
    if (typeof raw.doNotContact !== "boolean"
        || typeof raw.doNotContactReason !== "string"
        || raw.doNotContactReason.length > 1000) {
        throw Error("Restrição de contato inválida.");
    }
    const reason = raw.doNotContactReason.trim();
    if (raw.doNotContact && !reason) {
        throw Error("Informe o motivo para não contatar este lead.");
    }
    return {
        doNotContact: raw.doNotContact,
        doNotContactReason: raw.doNotContact
            ? reason
            : previous.doNotContactReason,
    };
}
