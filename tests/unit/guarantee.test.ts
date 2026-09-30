import { describe, it, expect } from "vitest";

import { canTransition, TRANSITIONS, STUDENT_LABELS } from "@/lib/guarantee/workflow";
import { roleCan } from "@/lib/org/access";
import { validateUpload, MAX_UPLOAD_BYTES } from "@/lib/storage";

/**
 * The claim state machine guards money. Its job is as much about what it
 * REFUSES as what it allows, so the forbidden transitions are tested
 * explicitly rather than assumed.
 */
describe("claim state machine", () => {
  it("allows the ordinary path through to a refund", () => {
    expect(canTransition("DRAFT", "SUBMITTED")).toBe(true);
    expect(canTransition("SUBMITTED", "UNDER_REVIEW")).toBe(true);
    expect(canTransition("UNDER_REVIEW", "APPROVED")).toBe(true);
    expect(canTransition("APPROVED", "REFUND_PROCESSING")).toBe(true);
    expect(canTransition("REFUND_PROCESSING", "REFUNDED")).toBe(true);
  });

  it("allows the information-request loop", () => {
    expect(canTransition("SUBMITTED", "NEEDS_INFORMATION")).toBe(true);
    expect(canTransition("NEEDS_INFORMATION", "SUBMITTED")).toBe(true);
    expect(canTransition("UNDER_REVIEW", "NEEDS_INFORMATION")).toBe(true);
  });

  it("refuses to un-refund a claim", () => {
    // The example the brief calls out by name.
    expect(canTransition("REFUNDED", "APPROVED")).toBe(false);
    expect(canTransition("REFUNDED", "UNDER_REVIEW")).toBe(false);
    expect(canTransition("REFUNDED", "REFUND_PROCESSING")).toBe(false);
  });

  it("refuses to skip review and approve a fresh claim", () => {
    expect(canTransition("SUBMITTED", "APPROVED")).toBe(false);
    expect(canTransition("DRAFT", "APPROVED")).toBe(false);
    expect(canTransition("DRAFT", "REFUNDED")).toBe(false);
  });

  it("refuses to refund without approving first", () => {
    expect(canTransition("UNDER_REVIEW", "REFUND_PROCESSING")).toBe(false);
    expect(canTransition("SUBMITTED", "REFUNDED")).toBe(false);
    expect(canTransition("REJECTED", "REFUND_PROCESSING")).toBe(false);
  });

  it("treats CLOSED as terminal", () => {
    expect(TRANSITIONS.CLOSED).toEqual([]);
    for (const status of Object.keys(TRANSITIONS)) {
      expect(canTransition("CLOSED", status as never)).toBe(false);
    }
  });

  it("lets a rejection be reopened for review, but never refunded directly", () => {
    expect(canTransition("REJECTED", "UNDER_REVIEW")).toBe(true);
    expect(canTransition("REJECTED", "APPROVED")).toBe(false);
  });

  it("has a student-facing label for every status", () => {
    for (const status of Object.keys(TRANSITIONS)) {
      expect(STUDENT_LABELS[status as never]).toBeTruthy();
    }
  });

  it("never lists a status as a transition to itself", () => {
    for (const [from, targets] of Object.entries(TRANSITIONS)) {
      expect(targets).not.toContain(from);
    }
  });
});

/**
 * Organisation roles. An instructor must not be able to invite or manage
 * seats, however the UI is rendered.
 */
describe("organisation roles", () => {
  it("gives an owner full control", () => {
    for (const cap of ["settings", "members", "licenses", "seats", "students", "invitations", "reports"]) {
      expect(roleCan("OWNER", cap)).toBe(true);
    }
  });

  it("lets an admin manage students and seats but not org settings", () => {
    expect(roleCan("ADMIN", "students")).toBe(true);
    expect(roleCan("ADMIN", "invitations")).toBe(true);
    expect(roleCan("ADMIN", "seats")).toBe(true);
    expect(roleCan("ADMIN", "settings")).toBe(false);
    expect(roleCan("ADMIN", "members")).toBe(false);
  });

  it("limits an instructor to reading students and reports", () => {
    expect(roleCan("INSTRUCTOR", "students:read")).toBe(true);
    expect(roleCan("INSTRUCTOR", "reports")).toBe(true);
    expect(roleCan("INSTRUCTOR", "invitations")).toBe(false);
    expect(roleCan("INSTRUCTOR", "seats")).toBe(false);
    expect(roleCan("INSTRUCTOR", "students")).toBe(false);
    expect(roleCan("INSTRUCTOR", "settings")).toBe(false);
  });

  it("treats write capability as implying read", () => {
    expect(roleCan("ADMIN", "students:read")).toBe(true);
    expect(roleCan("OWNER", "students:read")).toBe(true);
  });

  it("refuses an unknown capability for every role", () => {
    for (const role of ["OWNER", "ADMIN", "INSTRUCTOR"] as const) {
      expect(roleCan(role, "delete-everything")).toBe(false);
    }
  });
});

/** Document upload validation (§7). */
describe("upload validation", () => {
  const file = (name: string, type: string, size: number) => ({ name, type, size });

  it("accepts a PDF result sheet", () => {
    expect(validateUpload(file("result.pdf", "application/pdf", 50_000))).toBeNull();
  });

  it("accepts JPG and PNG", () => {
    expect(validateUpload(file("scan.jpg", "image/jpeg", 50_000))).toBeNull();
    expect(validateUpload(file("scan.png", "image/png", 50_000))).toBeNull();
  });

  it("rejects an executable, whatever it claims to be", () => {
    expect(validateUpload(file("payload.exe", "application/x-msdownload", 1000))).not.toBeNull();
    expect(validateUpload(file("payload.exe", "application/pdf", 1000))).toBeNull();
    // ...the mime type alone can lie, which is why the extension is checked too:
    expect(validateUpload(file("payload.exe", "text/plain", 1000))).not.toBeNull();
  });

  it("rejects an empty file", () => {
    expect(validateUpload(file("empty.pdf", "application/pdf", 0))).not.toBeNull();
  });

  it("rejects a file over the size limit", () => {
    expect(validateUpload(file("huge.pdf", "application/pdf", MAX_UPLOAD_BYTES + 1))).not.toBeNull();
    expect(validateUpload(file("ok.pdf", "application/pdf", MAX_UPLOAD_BYTES))).toBeNull();
  });

  it("accepts uppercase extensions", () => {
    expect(validateUpload(file("RESULT.PDF", "", 5000))).toBeNull();
  });
});
