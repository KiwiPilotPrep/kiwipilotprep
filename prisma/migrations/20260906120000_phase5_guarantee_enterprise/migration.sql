-- Phase 5: guarantee claims, refunds, flight school enterprise.
--
-- Refund.reviewedBy (a bare string) is replaced by processedById, a real
-- relation to the admin who actioned it. The table is empty at this point,
-- so no refund history is lost.

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'NEEDS_INFORMATION', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REFUND_PROCESSING', 'REFUNDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "RefundMethod" AS ENUM ('RAZORPAY', 'BANK_TRANSFER', 'MANUAL');

-- CreateEnum
CREATE TYPE "OrgRole" AS ENUM ('OWNER', 'ADMIN', 'INSTRUCTOR');

-- CreateEnum
CREATE TYPE "OrgStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'REMOVED');

-- CreateEnum
CREATE TYPE "SeatStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'REVOKED');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Refund" DROP COLUMN "reviewedBy",
ADD COLUMN     "claimId" TEXT,
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'NZD',
ADD COLUMN     "gatewayRefundId" TEXT,
ADD COLUMN     "initiatedAt" TIMESTAMP(3),
ADD COLUMN     "method" "RefundMethod" NOT NULL DEFAULT 'RAZORPAY',
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "processedById" TEXT,
ADD COLUMN     "reference" TEXT;

-- CreateTable
CREATE TABLE "GuaranteePolicy" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "terms" TEXT NOT NULL,
    "requiredStudyPercent" INTEGER NOT NULL DEFAULT 100,
    "requiredMockCount" INTEGER NOT NULL DEFAULT 1,
    "requiredMockPassPercent" INTEGER,
    "claimWindowDays" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuaranteePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuaifyingProduct" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "QuaifyingProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuaranteeClaim" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'DRAFT',
    "studyPercentAtClaim" INTEGER,
    "mocksCompletedAtClaim" INTEGER,
    "policyVersionAtClaim" TEXT,
    "examName" TEXT,
    "examSittingDate" TIMESTAMP(3),
    "examResult" TEXT,
    "studentNote" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuaranteeClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuaranteeDocument" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuaranteeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimAuditLog" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "status" "OrgStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "OrgRole" NOT NULL DEFAULT 'INSTRUCTOR',
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationStudent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMP(3),

    CONSTRAINT "OrganizationStudent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnterpriseLicense" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "orderId" TEXT,
    "seatsTotal" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnterpriseLicense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnterpriseSeat" (
    "id" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "organizationStudentId" TEXT,
    "status" "SeatStatus" NOT NULL DEFAULT 'AVAILABLE',
    "assignedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "EnterpriseSeat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationInvitation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "licenseId" TEXT,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "invitedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RebatePolicy" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "terms" TEXT NOT NULL,
    "requiredExamScore" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RebatePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RebateClaim" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "orderId" TEXT,
    "status" "ClaimStatus" NOT NULL DEFAULT 'DRAFT',
    "examName" TEXT,
    "examScore" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RebateClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuaranteePolicy_version_key" ON "GuaranteePolicy"("version");

-- CreateIndex
CREATE INDEX "GuaranteePolicy_active_idx" ON "GuaranteePolicy"("active");

-- CreateIndex
CREATE UNIQUE INDEX "QuaifyingProduct_policyId_productId_key" ON "QuaifyingProduct"("policyId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "GuaranteeClaim_reference_key" ON "GuaranteeClaim"("reference");

-- CreateIndex
CREATE INDEX "GuaranteeClaim_status_idx" ON "GuaranteeClaim"("status");

-- CreateIndex
CREATE INDEX "GuaranteeClaim_userId_createdAt_idx" ON "GuaranteeClaim"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GuaranteeClaim_userId_orderId_key" ON "GuaranteeClaim"("userId", "orderId");

-- CreateIndex
CREATE UNIQUE INDEX "GuaranteeDocument_storageKey_key" ON "GuaranteeDocument"("storageKey");

-- CreateIndex
CREATE INDEX "GuaranteeDocument_claimId_idx" ON "GuaranteeDocument"("claimId");

-- CreateIndex
CREATE INDEX "ClaimAuditLog_claimId_createdAt_idx" ON "ClaimAuditLog"("claimId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_status_idx" ON "Organization"("status");

-- CreateIndex
CREATE INDEX "OrganizationMember_userId_idx" ON "OrganizationMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organizationId_userId_key" ON "OrganizationMember"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "OrganizationStudent_organizationId_status_idx" ON "OrganizationStudent"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationStudent_organizationId_userId_key" ON "OrganizationStudent"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "EnterpriseLicense_organizationId_idx" ON "EnterpriseLicense"("organizationId");

-- CreateIndex
CREATE INDEX "EnterpriseSeat_licenseId_status_idx" ON "EnterpriseSeat"("licenseId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "EnterpriseSeat_licenseId_organizationStudentId_key" ON "EnterpriseSeat"("licenseId", "organizationStudentId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationInvitation_tokenHash_key" ON "OrganizationInvitation"("tokenHash");

-- CreateIndex
CREATE INDEX "OrganizationInvitation_organizationId_status_idx" ON "OrganizationInvitation"("organizationId", "status");

-- CreateIndex
CREATE INDEX "OrganizationInvitation_email_idx" ON "OrganizationInvitation"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RebatePolicy_version_key" ON "RebatePolicy"("version");

-- CreateIndex
CREATE INDEX "RebateClaim_userId_idx" ON "RebateClaim"("userId");

-- CreateIndex
CREATE INDEX "RebateClaim_status_idx" ON "RebateClaim"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Refund_gatewayRefundId_key" ON "Refund"("gatewayRefundId");

-- CreateIndex
CREATE INDEX "Refund_claimId_idx" ON "Refund"("claimId");

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "GuaranteeClaim"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuaifyingProduct" ADD CONSTRAINT "QuaifyingProduct_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "GuaranteePolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuaifyingProduct" ADD CONSTRAINT "QuaifyingProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuaranteeClaim" ADD CONSTRAINT "GuaranteeClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuaranteeClaim" ADD CONSTRAINT "GuaranteeClaim_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuaranteeClaim" ADD CONSTRAINT "GuaranteeClaim_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "GuaranteePolicy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuaranteeClaim" ADD CONSTRAINT "GuaranteeClaim_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuaranteeDocument" ADD CONSTRAINT "GuaranteeDocument_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "GuaranteeClaim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuaranteeDocument" ADD CONSTRAINT "GuaranteeDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimAuditLog" ADD CONSTRAINT "ClaimAuditLog_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "GuaranteeClaim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimAuditLog" ADD CONSTRAINT "ClaimAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationStudent" ADD CONSTRAINT "OrganizationStudent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationStudent" ADD CONSTRAINT "OrganizationStudent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnterpriseLicense" ADD CONSTRAINT "EnterpriseLicense_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnterpriseLicense" ADD CONSTRAINT "EnterpriseLicense_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnterpriseLicense" ADD CONSTRAINT "EnterpriseLicense_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnterpriseSeat" ADD CONSTRAINT "EnterpriseSeat_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "EnterpriseLicense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnterpriseSeat" ADD CONSTRAINT "EnterpriseSeat_organizationStudentId_fkey" FOREIGN KEY ("organizationStudentId") REFERENCES "OrganizationStudent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationInvitation" ADD CONSTRAINT "OrganizationInvitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationInvitation" ADD CONSTRAINT "OrganizationInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RebateClaim" ADD CONSTRAINT "RebateClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RebateClaim" ADD CONSTRAINT "RebateClaim_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "RebatePolicy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RebateClaim" ADD CONSTRAINT "RebateClaim_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

