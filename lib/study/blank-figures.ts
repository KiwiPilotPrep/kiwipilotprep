import type { Block } from "@/lib/content";

/**
 * Figures whose stored asset carries no diagram.
 *
 * FE-013 in the client audit: a lesson showed a large empty panel with a faint
 * NZAIP watermark and nothing else. The asset is not missing and does not fail
 * to load — it is a blank page. Every figure in the course material was decoded
 * and measured, and exactly one of 2,358 has no ink in it at all:
 *
 *   asset  cmtsa9kar015rc3zk46yzfcgw
 *   file   study/f4edbc692872b9527f490b9f550dcdac64dd8742.png
 *   617x474, 11 KB — 97.01% white, 2.99% watermark, 0.00% ink
 *   PPL Theory > Air Law > 1.12 The Time System
 *
 * For comparison, an ordinary figure in the same subject measures around 10%
 * ink. The source page this was extracted from carried no diagram.
 *
 * Skipping it here rather than deleting the block keeps the record that a
 * diagram belongs at that point: the caption stored with it says "A clock face
 * showing the twenty-four hour convention used for aviation times", which is
 * the brief for whoever supplies the real one. When that arrives, replace the
 * asset's bytes or drop its id from this list and the figure returns, caption
 * and all. Nothing in the database is changed.
 *
 * Nothing is invented to fill the gap, and nothing else is hidden. An id only
 * belongs here once its asset has been measured and found empty.
 */
export const BLANK_FIGURE_ASSET_IDS: ReadonlySet<string> = new Set([
  "cmtsa9kar015rc3zk46yzfcgw",
]);

/**
 * Drops figures whose asset is known to be blank. Every other block passes
 * through untouched and in order.
 */
export function dropBlankFigures(blocks: Block[]): Block[] {
  if (BLANK_FIGURE_ASSET_IDS.size === 0) return blocks;

  return blocks.filter(
    (block) => block.type !== "figure" || !BLANK_FIGURE_ASSET_IDS.has(block.assetId),
  );
}
