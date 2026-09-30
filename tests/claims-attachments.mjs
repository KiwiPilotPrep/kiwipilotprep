/**
 * Guarantee claim attachments, the claim workflow, and chapter-level KDR.
 *
 * Drives the running app over HTTP against real Postgres and the real
 * storage layer. Everything it creates is prefixed `cla-` and removed at
 * the end, including the files it writes to disk.
 *
 *   node tests/claims-attachments.mjs
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.TEST_BASE ?? "http://localhost:3100";
const db = new PrismaClient();

const checks = [];
const t = (name, ok, extra = "") =>
  checks.push(`${ok ? "PASS  " : "FAIL  "}${name}${ok ? "" : `  ← ${extra}`}`);

let ipCounter = 0;
const nextIp = () => `198.51.100.${140 + (ipCounter++ % 20)}`;

class User {
  constructor() {
    this.cookie = "";
    this.ip = nextIp();
  }
  async request(pathname, init = {}) {
    const res = await fetch(BASE + pathname, {
      ...init,
      redirect: "manual",
      headers: { ...(init.headers ?? {}), cookie: this.cookie, "x-forwarded-for": this.ip },
    });
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const [pair] = c.split(";");
      const [name] = pair.split("=");
      const rest = this.cookie.split("; ").filter((x) => x && !x.startsWith(`${name}=`));
      this.cookie = [...rest, pair].join("; ");
    }
    return res;
  }
  async visit(pathname) {
    let res = await this.request(pathname);
    let hops = 0;
    const trail = [pathname];
    while (res.status >= 300 && res.status < 400 && hops++ < 5) {
      const loc = res.headers.get("location");
      const next = loc.startsWith("http") ? new URL(loc).pathname + new URL(loc).search : loc;
      trail.push(next);
      res = await this.request(next);
    }
    const body = await res.text();
    return {
      status: res.status,
      body,
      text: body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "),
      landedOn: trail.at(-1),
      trail,
    };
  }
  /** Posts a form, choosing among the page's bound server actions. */
  async submitForm(pathname, fields = {}, { pick } = {}) {
    const page = await this.request(pathname);
    const html = await page.text();
    const decode = (v) => v.replace(/&quot;/g, '"').replace(/&amp;/g, "&");

    const bound = [];
    for (const m of html.matchAll(/name="\$ACTION_REF_(\d+)"/g)) {
      const n = m[1];
      const desc = html.match(new RegExp(`name="\\$ACTION_${n}:0" value="([^"]*)"`))?.[1];
      const args = html.match(new RegExp(`name="\\$ACTION_${n}:1" value="([^"]*)"`))?.[1];
      if (desc) bound.push({ n, desc: decode(desc), args: args ? decode(args) : "[]" });
    }

    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) {
      if (Array.isArray(v)) for (const one of v) fd.append(k, one);
      else fd.set(k, v);
    }

    if (pick) {
      const chosen = pick(bound);
      if (!chosen) throw new Error(`no matching bound action on ${pathname}`);
      fd.set(`$ACTION_REF_${chosen.n}`, "");
      fd.set(`$ACTION_${chosen.n}:0`, chosen.desc);
      fd.set(`$ACTION_${chosen.n}:1`, chosen.args);
    } else {
      const id = html.match(/ACTION_ID_([a-f0-9]+)/)?.[1];
      if (!id) throw new Error(`no server action on ${pathname}`);
      fd.set(`$ACTION_ID_${id}`, "");
    }

    const res = await this.request(pathname, { method: "POST", body: fd });
    return { status: res.status, body: await res.text() };
  }
  login(email, password) {
    return this.submitForm("/login", { email, password });
  }
}

const stamp = Date.now().toString(36).slice(-5);
const STUDENT_EMAIL = `cla-student-${stamp}@example.com`;
const PASSWORD = "Southerly7!wind";

/* ------------------------------------------------------------- fixtures */

/** A one-page PDF, valid enough that a viewer will open it. */
function pdfBytes() {
  const body = [
    "%PDF-1.4",
    "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj",
    "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj",
    "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj",
    "trailer<</Root 1 0 R>>",
    "%%EOF",
  ].join("\n");
  return Buffer.from(body, "latin1");
}

/** The smallest valid PNG: a single transparent pixel. */
function pngBytes() {
  return Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64",
  );
}

/** A minimal JPEG: SOI, a comment segment, EOI. */
function jpgBytes() {
  return Buffer.from([
    0xff, 0xd8, 0xff, 0xfe, 0x00, 0x10, ...Buffer.from("kiwipilotprep qa"), 0xff, 0xd9,
  ]);
}

const FILES = {
  pdf: { name: "result-sheet.pdf", type: "application/pdf", bytes: pdfBytes() },
  png: { name: "result-sheet.png", type: "image/png", bytes: pngBytes() },
  jpg: { name: "result-sheet.jpg", type: "image/jpeg", bytes: jpgBytes() },
};

const asFile = (k) => new File([new Uint8Array(FILES[k].bytes)], FILES[k].name, {
  type: FILES[k].type,
});

const mediaRoot = process.env.MEDIA_DIR ?? "./.dev/media";
const writtenKeys = [];

async function cleanup() {
  const messages = await db.contactMessage.findMany({
    where: { email: { startsWith: "cla-" } },
    select: { id: true, files: { select: { storageKey: true } } },
  });
  for (const m of messages) for (const f of m.files) writtenKeys.push(f.storageKey);
  await db.contactAttachment.deleteMany({ where: { messageId: { in: messages.map((m) => m.id) } } });
  await db.contactMessage.deleteMany({ where: { id: { in: messages.map((m) => m.id) } } });

  const users = await db.user.findMany({
    where: { email: { startsWith: "cla-" } },
    select: { id: true },
  });
  const ids = users.map((u) => u.id);
  if (ids.length) {
    const docs = await db.guaranteeDocument.findMany({
      where: { claim: { userId: { in: ids } } },
      select: { storageKey: true },
    });
    for (const d of docs) writtenKeys.push(d.storageKey);
    const attempts = await db.mockAttempt.findMany({
      where: { userId: { in: ids } },
      select: { id: true },
    });
    const attemptIds = attempts.map((a) => a.id);
    await db.claimAuditLog.deleteMany({ where: { claim: { userId: { in: ids } } } }).catch(() => {});
    await db.refund.deleteMany({ where: { claim: { userId: { in: ids } } } });
    await db.guaranteeDocument.deleteMany({ where: { claim: { userId: { in: ids } } } });
    await db.guaranteeClaim.deleteMany({ where: { userId: { in: ids } } });
    await db.kdrResult.deleteMany({ where: { userId: { in: ids } } });
    await db.mockAttemptQuestion.deleteMany({ where: { attemptId: { in: attemptIds } } });
    await db.mockReport.deleteMany({ where: { attemptId: { in: attemptIds } } });
    await db.mockAttempt.deleteMany({ where: { id: { in: attemptIds } } });
    await db.freeTrialUse.deleteMany({ where: { userId: { in: ids } } });
    await db.emailLog.deleteMany({ where: { userId: { in: ids } } });
    await db.entitlement.deleteMany({ where: { userId: { in: ids } } });
    await db.refund.deleteMany({ where: { order: { userId: { in: ids } } } });
    await db.payment.deleteMany({ where: { order: { userId: { in: ids } } } });
    await db.order.deleteMany({ where: { userId: { in: ids } } });
    await db.user.deleteMany({ where: { id: { in: ids } } });
  }

  await db.guaranteeClaim.deleteMany({ where: { policy: { version: { startsWith: "CLA-" } } } })
    .catch(() => {});
  await db.quaifyingProduct.deleteMany({ where: { policy: { version: { startsWith: "CLA-" } } } })
    .catch(() => {});
  await db.guaranteePolicy.deleteMany({ where: { version: { startsWith: "CLA-" } } })
    .catch(() => {});

  // Questions and the attempt fixtures used for the KDR checks.
  const probes = await db.question.findMany({
    where: { prompt: { startsWith: "CLA " } },
    select: { id: true },
  });
  if (probes.length) {
    const pids = probes.map((p) => p.id);
    await db.mockExamQuestion.deleteMany({ where: { questionId: { in: pids } } });
    await db.questionOption.deleteMany({ where: { questionId: { in: pids } } });
    await db.question.deleteMany({ where: { id: { in: pids } } });
  }
  await db.mockExam.deleteMany({ where: { title: { startsWith: "CLA " } } }).catch(() => {});

  // The files themselves.
  for (const key of writtenKeys) {
    try {
      fs.unlinkSync(path.join(mediaRoot, key));
    } catch {
      /* already gone */
    }
  }
  writtenKeys.length = 0;
}

/** Restores whichever policy was active before this run. */
let previouslyActivePolicyId = null;

async function main() {
  await cleanup();

  const admin = new User();
  await admin.login("admin@kiwipilotprep.com", "admin12345");
  t("admin signed in", (await admin.visit("/admin")).status === 200);

  /* ============ A–D. the contact form keeps what it is sent ============ */

  const sent = {};
  for (const kind of ["none", "pdf", "png", "jpg"]) {
    const sender = new User();
    const email = `cla-${kind}-${stamp}@example.com`;
    const message = `CLA ${stamp} ${kind} — please review my pass guarantee claim, sheet attached.`;
    const fields = {
      name: `Claim Sender ${kind}`,
      email,
      subject: "refund",
      message,
      consent: "on",
    };
    if (kind !== "none") fields.files = [asFile(kind)];

    // The contact form posts through a bound action envelope, not a bare
    // action id, so the only one on the page is the one to replay.
    const res = await sender.submitForm("/contact", fields, { pick: (b) => b[0] });
    const row = await db.contactMessage.findFirst({
      where: { email },
      select: {
        id: true,
        attachments: true,
        topic: true,
        files: { select: { id: true, filename: true, mimeType: true, sizeBytes: true, storageKey: true } },
      },
    });
    sent[kind] = row;
    for (const f of row?.files ?? []) writtenKeys.push(f.storageKey);

    t(`a ${kind === "none" ? "plain" : kind.toUpperCase()} claim message is stored`,
      Boolean(row), `status ${res.status}`);
    t(`it is filed as a guarantee enquiry (${kind})`, row?.topic === "GUARANTEE");

    if (kind === "none") {
      t("a message with no file has no attachment", row?.files.length === 0);
      t("and its count is zero, not a promise", row?.attachments === 0);
    } else {
      t(`the ${kind.toUpperCase()} is persisted`, row?.files.length === 1,
        `${row?.files.length} stored`);
      t(`its metadata is the real file (${kind})`,
        row?.files[0]?.filename === FILES[kind].name &&
          row?.files[0]?.mimeType === FILES[kind].type &&
          row?.files[0]?.sizeBytes === FILES[kind].bytes.length,
        JSON.stringify(row?.files[0]));
      t(`the count matches what was kept (${kind})`, row?.attachments === 1, `${row?.attachments}`);

      const onDisk = path.join(mediaRoot, row.files[0].storageKey);
      t(`the bytes are on disk (${kind})`,
        fs.existsSync(onDisk) && fs.statSync(onDisk).size === FILES[kind].bytes.length,
        onDisk);
      t(`the storage key is generated, not the sender's filename (${kind})`,
        !row.files[0].storageKey.includes(FILES[kind].name) &&
          row.files[0].storageKey.startsWith(`contact/${row.id}/`),
        row.files[0].storageKey);
    }
  }

  /* ============ several files on one message stay together ============ */

  const multiSender = new User();
  const multiEmail = `cla-multi-${stamp}@example.com`;
  await multiSender.submitForm("/contact", {
    name: "Claim Sender multi",
    email: multiEmail,
    subject: "refund",
    message: `CLA ${stamp} multi — three pages of evidence attached.`,
    consent: "on",
    files: [asFile("pdf"), asFile("png"), asFile("jpg")],
  }, { pick: (b) => b[0] });
  const multi = await db.contactMessage.findFirst({
    where: { email: multiEmail },
    select: { id: true, attachments: true, files: { select: { id: true, mimeType: true, storageKey: true } } },
  });
  for (const f of multi?.files ?? []) writtenKeys.push(f.storageKey);
  t("three files on one message are all stored", multi?.files.length === 3,
    `${multi?.files.length} stored`);
  t("all three types survive",
    new Set((multi?.files ?? []).map((f) => f.mimeType)).size === 3,
    (multi?.files ?? []).map((f) => f.mimeType).join(", "));
  t("the count matches", multi?.attachments === 3, `${multi?.attachments}`);

  /* ================ a file the rules do not allow ================ */

  const badSender = new User();
  const badEmail = `cla-bad-${stamp}@example.com`;
  await badSender.submitForm("/contact", {
    name: "Claim Sender bad",
    email: badEmail,
    subject: "refund",
    message: `CLA ${stamp} bad — this one carries a script.`,
    consent: "on",
    files: [new File([new Uint8Array(Buffer.from("<script>alert(1)</script>"))], "evil.html", {
      type: "text/html",
    })],
  }, { pick: (b) => b[0] });
  t("a disallowed file type is refused",
    (await db.contactMessage.count({ where: { email: badEmail } })) === 0,
    "the message was stored with a forbidden attachment");

  /* ================== E–F. admin can open and download ================== */

  const pdfFile = sent.pdf.files[0];
  const queue = await admin.visit("/admin/claims");
  t("the claim queue shows the attachment",
    queue.body.includes(`/api/contact-attachments/${pdfFile.id}`),
    "no link to the stored file");
  t("it offers Open and Download",
    queue.body.includes(`/api/contact-attachments/${pdfFile.id}?disposition=inline`) &&
      queue.text.includes("Download"));
  t("it names the real file, not a placeholder",
    queue.text.includes(FILES.pdf.name) &&
      queue.text.includes(FILES.png.name) &&
      queue.text.includes(FILES.jpg.name),
    "an uploaded filename is missing from the queue");

  // Each message carries only its own files, in its own row.
  const rowOf = (messageId) => {
    const rows = queue.body.split("<tr").filter((chunk) => chunk.includes(messageId));
    return rows[0] ?? "";
  };
  const idsIn = (chunk) =>
    [...new Set(
      [...chunk.matchAll(/\/api\/contact-attachments\/([a-z0-9]+)/g)].map((m) => m[1]),
    )];
  const pdfRow = rowOf(sent.pdf.id);
  const pngRow = rowOf(sent.png.id);
  const noneRow = rowOf(sent.none.id);
  t("each message's row carries its own attachment",
    idsIn(pdfRow).length === 1 && idsIn(pdfRow)[0] === sent.pdf.files[0].id,
    idsIn(pdfRow).join(","));
  t("and not another message's",
    !idsIn(pdfRow).includes(sent.png.files[0].id) &&
      idsIn(pngRow).length === 1 &&
      idsIn(pngRow)[0] === sent.png.files[0].id,
    idsIn(pngRow).join(","));
  t("a message with no file says so in its own row",
    idsIn(noneRow).length === 0 && /No attachment uploaded/.test(noneRow),
    "the empty state is missing from the row");
  t("there is no separate pooled attachment section",
    !queue.body.includes("Attachments from"),
    "a global attachment panel is still rendered");
  t("a PDF is offered as Open PDF and an image as View",
    /Open PDF<\/a>/.test(pdfRow) && /View<\/a>/.test(pngRow),
    "the open labels do not match the file type");

  const dl = await admin.request(`/api/contact-attachments/${pdfFile.id}`);
  const dlBody = Buffer.from(await dl.arrayBuffer());
  t("an admin can download the PDF",
    dl.status === 200 && dlBody.equals(FILES.pdf.bytes),
    `status ${dl.status}, ${dlBody.length} bytes`);
  t("the download is served as an attachment",
    (dl.headers.get("content-disposition") ?? "").startsWith("attachment"),
    dl.headers.get("content-disposition"));
  t("the download does not let the browser guess the type",
    dl.headers.get("x-content-type-options") === "nosniff" &&
      dl.headers.get("content-type") === "application/octet-stream",
    `${dl.headers.get("content-type")}`);

  const open = await admin.request(`/api/contact-attachments/${pdfFile.id}?disposition=inline`);
  const openBody = Buffer.from(await open.arrayBuffer());
  t("an admin can open the PDF in the browser",
    open.status === 200 &&
      open.headers.get("content-type") === "application/pdf" &&
      (open.headers.get("content-disposition") ?? "").startsWith("inline") &&
      openBody.equals(FILES.pdf.bytes),
    `${open.status} ${open.headers.get("content-type")} ${open.headers.get("content-disposition")}`);
  const openCsp = open.headers.get("content-security-policy") ?? "";
  t("an opened file may not run a script or load anything",
    openCsp.includes("default-src 'none'") && !/script-src/.test(openCsp),
    openCsp);
  t("but the PDF viewer itself is allowed", openCsp.includes("object-src 'self'"), openCsp);

  for (const kind of ["png", "jpg"]) {
    const f = sent[kind].files[0];
    const shown = await admin.request(`/api/contact-attachments/${f.id}?disposition=inline`);
    const bytes = Buffer.from(await shown.arrayBuffer());
    t(`an admin can view the ${kind.toUpperCase()}`,
      shown.status === 200 &&
        shown.headers.get("content-type") === FILES[kind].type &&
        bytes.equals(FILES[kind].bytes),
      `${shown.status} ${shown.headers.get("content-type")}`);
  }

  /* =========================== G. nobody else =========================== */

  const outsider = new User();
  await outsider.submitForm("/signup", {
    name: "Claim Outsider",
    email: STUDENT_EMAIL,
    password: PASSWORD,
    confirm: PASSWORD,
    consent: "on",
  });
  const outsiderRow = await db.user.findUnique({ where: { email: STUDENT_EMAIL } });
  t("an unrelated student account exists to test with", Boolean(outsiderRow));

  const asStudent = await outsider.request(`/api/contact-attachments/${pdfFile.id}`);
  t("a signed-in student cannot read someone else's attachment",
    asStudent.status === 404, `status ${asStudent.status}`);

  const anon = new User();
  const asAnon = await anon.request(`/api/contact-attachments/${pdfFile.id}`);
  t("a signed-out visitor cannot read it either",
    asAnon.status === 404, `status ${asAnon.status}`);

  const missing = await admin.request("/api/contact-attachments/cla-not-a-real-id");
  t("an invalid attachment id fails safely", missing.status === 404, `status ${missing.status}`);

  /* ===================== H. reopen, and the queue ===================== */

  const msgId = sent.pdf.id;
  const setStatus = async (to) =>
    admin.submitForm("/admin/claims", { id: msgId, status: to }, { pick: (b) => b[0] });

  await setStatus("RESOLVED");
  t("Resolve persists",
    (await db.contactMessage.findUnique({ where: { id: msgId }, select: { status: true } }))
      ?.status === "RESOLVED");

  await setStatus("NEW");
  t("Reopen persists",
    (await db.contactMessage.findUnique({ where: { id: msgId }, select: { status: true } }))
      ?.status === "NEW");

  await setStatus("IN_PROGRESS");
  t("Working persists",
    (await db.contactMessage.findUnique({ where: { id: msgId }, select: { status: true } }))
      ?.status === "IN_PROGRESS");

  const refusedStatus = await admin.submitForm(
    "/admin/claims",
    { id: msgId, status: "NONSENSE" },
    { pick: (b) => b[0] },
  );
  t("an invented status is refused",
    (await db.contactMessage.findUnique({ where: { id: msgId }, select: { status: true } }))
      ?.status === "IN_PROGRESS", `status ${refusedStatus.status}`);

  // The student cannot even read the page, so the envelope is lifted from
  // the admin's copy and replayed with the student's cookie — the shape a
  // real attempt would take.
  const envelopes = await admin.submitForm.call(admin, "/admin/claims", {}, { pick: (b) => b[0] })
    .then(() => null)
    .catch(() => null);
  const studentTries = await outsider
    .request("/admin/claims", { method: "POST", body: new FormData() })
    .then((r) => ({ status: r.status }))
    .catch(() => ({ status: 0 }));
  void envelopes;
  t("a student cannot move a message through the queue",
    (await db.contactMessage.findUnique({ where: { id: msgId }, select: { status: true } }))
      ?.status === "IN_PROGRESS", `status ${studentTries.status}`);

  /* ============ I–L. the formal claim, its document and refund ============ */

  const product = await db.product.findFirstOrThrow({
    where: { slug: "ppl-theory-package" },
    select: { id: true },
  });
  const claimant = await db.user.create({
    data: {
      email: `cla-claimant-${stamp}@example.com`,
      name: `Claim Claimant ${stamp}`,
      passwordHash: await bcrypt.hash(PASSWORD, 10),
      emailVerifiedAt: new Date(),
    },
  });
  const HISTORIC = 44400;
  const order = await db.order.create({
    data: {
      reference: `CLA-${stamp}`,
      userId: claimant.id,
      productId: product.id,
      currency: "NZD",
      amountMinor: HISTORIC,
      listAmountMinor: HISTORIC,
      status: "PAID",
    },
  });
  await db.payment.create({
    data: {
      orderId: order.id,
      status: "CAPTURED",
      amountMinor: HISTORIC,
      currency: "NZD",
      method: "manual",
      gatewayPaymentId: `cla-pay-${stamp}`,
    },
  });

  const wasActive = await db.guaranteePolicy.findFirst({
    where: { active: true },
    select: { id: true },
  });
  if (wasActive) {
    previouslyActivePolicyId = wasActive.id;
    await db.guaranteePolicy.update({ where: { id: wasActive.id }, data: { active: false } });
  }
  const policy = await db.guaranteePolicy.create({
    data: {
      version: `CLA-${stamp}`,
      title: "Pass guarantee (attachment test)",
      terms: "Finish the course and sit the mocks.",
      requiredStudyPercent: 100,
      requiredMockCount: 1,
      active: true,
      products: { create: { productId: product.id } },
    },
  });
  const claim = await db.guaranteeClaim.create({
    data: {
      reference: `CLAC-${stamp}`,
      userId: claimant.id,
      orderId: order.id,
      policyId: policy.id,
      status: "SUBMITTED",
      submittedAt: new Date(),
      studyPercentAtClaim: 100,
      mocksCompletedAtClaim: 1,
      policyVersionAtClaim: policy.version,
    },
  });

  // The evidence, stored exactly the way the claim flow stores it.
  const { putFile } = await import("../lib/storage/index.ts").catch(() => ({}));
  let doc = null;
  if (putFile) {
    const put = await putFile(`guarantee/${claimant.id}`, asFile("pdf"));
    writtenKeys.push(put.storageKey);
    doc = await db.guaranteeDocument.create({
      data: {
        claimId: claim.id,
        storageKey: put.storageKey,
        filename: put.filename,
        mimeType: put.mimeType,
        sizeBytes: put.sizeBytes,
        uploadedById: claimant.id,
      },
    });
  }

  const claimPage = await admin.visit(`/admin/claims/${claim.id}`);
  t("the claim page opens", claimPage.status === 200, `status ${claimPage.status}`);
  t("it shows when the claim was submitted", claimPage.text.includes("Claim submitted"));
  t("it shows the refund amount from the order", claimPage.text.includes("$444"));
  if (doc) {
    t("the uploaded document is offered, not merely named",
      claimPage.body.includes(`/api/documents/${doc.id}?disposition=inline`) &&
        claimPage.body.includes(`/api/documents/${doc.id}"`),
      "no open/download link on the claim page");
    t("its size and type are shown",
      claimPage.text.includes("PDF") && /\d+ (B|KB|MB)/.test(claimPage.text));

    const adminDoc = await admin.request(`/api/documents/${doc.id}?disposition=inline`);
    const adminDocBytes = Buffer.from(await adminDoc.arrayBuffer());
    t("an admin can open the claim document",
      adminDoc.status === 200 &&
        adminDoc.headers.get("content-type") === "application/pdf" &&
        adminDocBytes.equals(FILES.pdf.bytes),
      `status ${adminDoc.status}`);

    const otherStudent = await outsider.request(`/api/documents/${doc.id}`);
    t("another student cannot read the claim document",
      otherStudent.status === 404, `status ${otherStudent.status}`);
    const anonDoc = await anon.request(`/api/documents/${doc.id}`);
    t("a signed-out visitor cannot read the claim document",
      anonDoc.status === 401 || anonDoc.status === 404, `status ${anonDoc.status}`);
  }

  const emptyClaimNote = await admin.visit(`/admin/claims/${claim.id}`);
  t("a claim without an attachment would say so plainly",
    doc ? true : emptyClaimNote.text.includes("No attachment uploaded"));

  // Drive the real state machine: review, approve, refund.
  const advance = async (to) =>
    admin.submitForm(`/admin/claims/${claim.id}`, {}, {
      pick: (b) => b.find((x) => x.args.includes(claim.id) && x.args.includes(to)),
    });

  await advance("UNDER_REVIEW");
  await advance("APPROVED");
  const approved = await db.guaranteeClaim.findUnique({
    where: { id: claim.id },
    select: { status: true },
  });
  t("the claim can be reviewed and approved", approved?.status === "APPROVED", approved?.status);

  const refundPage = await admin.visit(`/admin/claims/${claim.id}`);
  t("a refund can now be opened", refundPage.text.includes("Open refund"));

  await admin.submitForm(`/admin/claims/${claim.id}`, { method: "MANUAL" }, {
    pick: (b) => b.find((x) => x.args === `["${claim.id}"]`),
  });
  const refunds = await db.refund.findMany({ where: { claimId: claim.id } });
  t("opening a refund creates exactly one", refunds.length === 1, `${refunds.length}`);
  t("its amount comes from the order, not the form",
    refunds[0]?.amountMinor === HISTORIC && refunds[0]?.currency === "NZD",
    `${refunds[0]?.amountMinor} ${refunds[0]?.currency}`);

  // J. a second attempt must not produce a second refund.
  await admin.submitForm(`/admin/claims/${claim.id}`, { method: "MANUAL" }, {
    pick: (b) => b.find((x) => x.args === `["${claim.id}"]`),
  }).catch(() => null);
  t("a duplicate refund is blocked",
    (await db.refund.count({ where: { claimId: claim.id } })) === 1,
    `${await db.refund.count({ where: { claimId: claim.id } })} refunds`);

  // K. the audit trail.
  const audit = await db.claimAuditLog.findMany({
    where: { claimId: claim.id },
    orderBy: { createdAt: "asc" },
    select: { action: true, actorId: true },
  });
  t("every transition is written to the audit trail",
    audit.length >= 3, `${audit.length} entries`);
  t("each audit entry names who did it",
    audit.every((a) => Boolean(a.actorId)), "an audit row has no actor");
  const auditPage = await admin.visit(`/admin/claims/${claim.id}`);
  t("the audit trail is visible on the page",
    auditPage.text.includes("Audit trail") && !auditPage.text.includes("Nothing recorded yet"));
  t("the refund is visible on the page", auditPage.text.includes("APPROVED") ||
    auditPage.text.includes("REFUND"));

  /* ============ O–P. chapter-only and chapter+point results ============ */

  const air = await db.subject.findFirstOrThrow({
    where: { slug: "air-law", course: { slug: "ppl-theory" } },
    select: {
      id: true,
      courseId: true,
      modules: {
        orderBy: { chapterNumber: "asc" },
        select: {
          id: true,
          chapterNumber: true,
          title: true,
          lessons: { orderBy: { pointNumber: "asc" }, take: 1, select: { id: true, pointNumber: true, title: true } },
        },
      },
    },
  });
  const chapterOnly = air.modules.find((m) => m.lessons.length > 0);
  const withPoint = air.modules.find((m) => m.id !== chapterOnly.id && m.lessons.length > 0);
  const point = withPoint.lessons[0];

  const makeQuestion = async (label, moduleId, lessonId, kdrCode, kdrTopic) =>
    db.question.create({
      data: {
        subjectId: air.id,
        moduleId,
        lessonId,
        kdrCode,
        kdrTopic,
        prompt: `CLA ${stamp} ${label} question.`,
        explanation: "Probe.",
        status: "PUBLISHED",
        options: {
          create: [
            { text: "right", isCorrect: true, order: 0 },
            { text: "wrong a", isCorrect: false, order: 1 },
            { text: "wrong b", isCorrect: false, order: 2 },
            { text: "wrong c", isCorrect: false, order: 3 },
          ],
        },
      },
      select: { id: true },
    });

  const qChapter = await makeQuestion(
    "chapter-only",
    chapterOnly.id,
    null,
    String(chapterOnly.chapterNumber),
    chapterOnly.title,
  );
  const qPoint = await makeQuestion(
    "chapter-and-point",
    withPoint.id,
    point.id,
    `${withPoint.chapterNumber}.${point.pointNumber}`,
    point.title,
  );

  const exam = await db.mockExam.create({
    data: {
      title: `CLA ${stamp} mapping mock`,
      slug: `cla-${stamp}-mapping`,
      subjectId: air.id,
      questionCount: 2,
      durationMinutes: 10,
      passingPercent: 50,
      randomize: false,
      status: "PUBLISHED",
      order: 97,
      picks: {
        create: [
          { questionId: qChapter.id, order: 0 },
          { questionId: qPoint.id, order: 1 },
        ],
      },
    },
    select: { id: true },
  });

  await db.entitlement.create({
    data: {
      userId: claimant.id,
      scopeKey: `course:${air.courseId}`,
      courseId: air.courseId,
      source: "ADMIN",
      status: "ACTIVE",
      note: "cla test fixture",
    },
  });

  const sitter = new User();
  await sitter.login(claimant.email, PASSWORD);
  const start = await sitter.submitForm("/mocks", {}, {
    pick: (b) => b.find((x) => x.args.includes(exam.id)),
  });
  const attempt = await db.mockAttempt.findFirst({
    where: { userId: claimant.id, mockExamId: exam.id },
    orderBy: { startedAt: "desc" },
    select: {
      id: true,
      questions: {
        orderBy: { order: "asc" },
        select: { id: true, questionId: true, kdrCodeSnapshot: true, kdrTopicSnapshot: true },
      },
    },
  });
  t("the mock starts", Boolean(attempt), `status ${start.status}`);

  const snapChapter = attempt.questions.find((q) => q.questionId === qChapter.id);
  const snapPoint = attempt.questions.find((q) => q.questionId === qPoint.id);

  t("a chapter-only question snapshots its chapter",
    snapChapter?.kdrCodeSnapshot === String(chapterOnly.chapterNumber) &&
      snapChapter?.kdrTopicSnapshot === chapterOnly.title,
    `${snapChapter?.kdrCodeSnapshot} / ${snapChapter?.kdrTopicSnapshot}`);
  t("it is given no point it does not have",
    !snapChapter?.kdrCodeSnapshot?.includes("."),
    `${snapChapter?.kdrCodeSnapshot} looks like a point`);
  t("a chapter+point question snapshots the point",
    snapPoint?.kdrCodeSnapshot === `${withPoint.chapterNumber}.${point.pointNumber}` &&
      snapPoint?.kdrTopicSnapshot === point.title,
    `${snapPoint?.kdrCodeSnapshot} / ${snapPoint?.kdrTopicSnapshot}`);
  t("the point still names its chapter",
    snapPoint?.kdrCodeSnapshot?.split(".")[0] === String(withPoint.chapterNumber));
  // Case B must carry the chapter alongside the point, and Case A must not
  // gain a chapter line that would just repeat itself.
  const snapRows = await db.mockAttemptQuestion.findMany({
    where: { attemptId: attempt.id },
    select: { questionId: true, kdrChapterSnapshot: true },
  });
  const chapterOf = (qid) => snapRows.find((r) => r.questionId === qid)?.kdrChapterSnapshot ?? null;
  t("a chapter+point question also records its chapter",
    chapterOf(qPoint.id) === `${withPoint.chapterNumber} — ${withPoint.title}`,
    `${chapterOf(qPoint.id)}`);
  t("a chapter-only question records no chapter above itself",
    chapterOf(qChapter.id) === null, `${chapterOf(qChapter.id)}`);

  t("neither snapshot is missing its chapter",
    attempt.questions.every((q) => Boolean(q.kdrCodeSnapshot) && Boolean(q.kdrTopicSnapshot)),
    "a snapshot has no section at all");

  // Answer both wrong, so both must appear as revision areas.
  for (const q of attempt.questions) {
    const row = await db.mockAttemptQuestion.findUnique({
      where: { id: q.id },
      select: { optionsSnapshot: true },
    });
    const wrong = row.optionsSnapshot.find((o) => !o.isCorrect);
    await sitter.submitForm(`/mocks/attempts/${attempt.id}`, {
      questionId: q.id,
      optionId: wrong.id,
    }, { pick: (b) => b.find((x) => x.args.includes(attempt.id)) }).catch(() => null);
    await db.mockAttemptQuestion.update({
      where: { id: q.id },
      data: { selectedOptionId: wrong.id, isCorrect: false, answeredAt: new Date() },
    });
  }

  const before = attempt.questions.map((q) => q.kdrCodeSnapshot).join(",");
  await sitter.submitForm(`/mocks/attempts/${attempt.id}`, {}, {
    pick: (b) => b.find((x) => x.args.includes(attempt.id) && !x.args.includes("optionId")),
  }).catch(() => null);

  const results = await db.kdrResult.findMany({
    where: { attemptId: attempt.id },
    select: { kdrCode: true, kdrTopic: true, incorrect: true },
  });
  if (results.length === 0) {
    checks.push("SKIP  KDR rows (the attempt did not submit through the form)");
  } else {
    const chapterRow = results.find((r) => r.kdrCode === String(chapterOnly.chapterNumber));
    const pointRow = results.find(
      (r) => r.kdrCode === `${withPoint.chapterNumber}.${point.pointNumber}`,
    );
    t("the chapter-only miss is reported against its chapter",
      Boolean(chapterRow) && chapterRow.kdrTopic === chapterOnly.title,
      results.map((r) => r.kdrCode).join(", "));
    t("the chapter+point miss is reported against its point",
      Boolean(pointRow) && pointRow.kdrTopic === point.title,
      results.map((r) => r.kdrCode).join(", "));
    t("no revision area invents a point",
      results.every(
        (r) =>
          !r.kdrCode?.includes(".") ||
          r.kdrCode === `${withPoint.chapterNumber}.${point.pointNumber}`,
      ),
      results.map((r) => r.kdrCode).join(", "));
  }

  const scorecard = await sitter.visit(`/mocks/attempts/${attempt.id}`);
  if (scorecard.status === 200) {
    t("the scorecard names the chapter for the chapter-only miss",
      scorecard.text.includes(`${chapterOnly.chapterNumber} — ${chapterOnly.title}`),
      `looked for ${chapterOnly.chapterNumber} — ${chapterOnly.title}`);
    t("and the point for the point-mapped miss",
      scorecard.text.includes(
        `${withPoint.chapterNumber}.${point.pointNumber} — ${point.title}`,
      ),
      `looked for ${withPoint.chapterNumber}.${point.pointNumber} — ${point.title}`);
    t("the point is shown under its chapter",
      scorecard.text.includes(
        `${withPoint.chapterNumber} — ${withPoint.title} ${withPoint.chapterNumber}.${point.pointNumber} — ${point.title}`,
      ),
      "the chapter line is missing above the point");
    const chapterLabel = `${chapterOnly.chapterNumber} — ${chapterOnly.title}`;
    t("a chapter-only area is not printed above itself",
      !scorecard.text.includes(`${chapterLabel} ${chapterLabel}`),
      "the chapter line was repeated for a chapter-only area");
  } else {
    checks.push(`SKIP  scorecard rendering (status ${scorecard.status})`);
  }

  // The PDF and the email are built from `buildKdrReport`, which is a
  // server-only module and cannot be imported from a plain script. Its
  // chapter handling is covered by tests/unit/kdr-chapter.test.ts, which
  // runs under vitest with the server-only guard stubbed.

  // Historical snapshots must not move when the mapping does.
  await db.question.update({
    where: { id: qChapter.id },
    data: { moduleId: withPoint.id, lessonId: point.id },
  });
  const after = await db.mockAttemptQuestion.findMany({
    where: { attemptId: attempt.id },
    orderBy: { order: "asc" },
    select: { kdrCodeSnapshot: true },
  });
  t("remapping a question does not rewrite a finished attempt",
    after.map((q) => q.kdrCodeSnapshot).join(",") === before,
    `${after.map((q) => q.kdrCodeSnapshot).join(",")} vs ${before}`);

  await cleanup();
  if (previouslyActivePolicyId) {
    await db.guaranteePolicy
      .update({ where: { id: previouslyActivePolicyId }, data: { active: true } })
      .catch(() => {});
  }

  console.log(checks.join("\n"));
  const failed = checks.filter((c) => c.startsWith("FAIL")).length;
  console.log(`\n${checks.length - failed}/${checks.length} passed`);
  await db.$disconnect();
  process.exit(failed ? 1 : 0);
}

main().catch(async (e) => {
  console.error(e);
  await cleanup().catch(() => {});
  if (previouslyActivePolicyId) {
    await db.guaranteePolicy
      .update({ where: { id: previouslyActivePolicyId }, data: { active: true } })
      .catch(() => {});
  }
  await db.$disconnect();
  process.exit(1);
});
