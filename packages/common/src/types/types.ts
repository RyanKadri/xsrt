import { AssetEntity } from "./asset";
import { ChunkEntity } from "./chunk";
import { RecordingEntity } from "./recording";
import { TargetEntity } from "./targets";

export type ScrapedElement = ScrapedHtmlElement | ScrapedTextElement;
export type OptimizedElement = OptimizedHtmlElementInfo | OptimizedTextElementInfo;

export interface ScrapedHtmlElement extends OptimizedHtmlElementInfo {
  domElement?: Element;
  attributes: ScrapedAttribute[];
  children: ScrapedElement[];
}

export interface ScrapedTextElement extends OptimizedTextElementInfo {
  domElement?: Element;
}

export interface ScrapedAttribute {
  name: string;
  value: string;
  references?: number[];
}

export type ScrapedStyleRule = ScrapedMediaRule | ScrapedFontFaceRule | ScrapedSupportsRule
  | BasicRule | ImportRule | KeyframesRule;

export interface ScrapedMediaRule extends BaseScrapedRule {
  conditions: string[];
  type: "media";
}

export interface ScrapedFontFaceRule extends BaseScrapedRule {
  src: string;
  type: "font-face";
}

export interface ScrapedSupportsRule extends BaseScrapedRule {
  condition: string;
  type: "supports";
}

export interface ImportRule extends BaseScrapedRule {
  conditions: string[];
  src: string;
  type: "import";
}

export interface BasicRule extends BaseScrapedRule {
  type: "style";
  selector: string;
}

export interface KeyframesRule extends BaseScrapedRule {
  type: "keyframe";
}

interface BaseScrapedRule {
  text: string;
  source?: string;
}

export type BaseRecording = Pick<RecordingEntity,
  "id" | "uuid" | "thumbnailPath" | "duration" | "uaDetails" | "finalized"
> & {
  startTime: number;
}

export type RecordingOverview = BaseRecording & {
  chunks: ChunkOverview[];
}

export type ChunkOverview = Pick<ChunkEntity, "id" | "chunkType" | "startTime" | "endTime">;

export type Recording = BaseRecording & {
  chunks: RecordingChunk[];
}

export interface UADetails {
  browser: {
    name: string;
  };

  os: {
    name: string;
  };

  device: {
    vendor: string;
  };
}

export type RecordingChunk = SnapshotChunk | DiffChunk;

export type PendingChunk = PendingSnapshotChunk | PendingDiffChunk;

export type PendingSnapshotChunk = Omit<SnapshotChunk, "uuid">;
export type PendingDiffChunk = Omit<DiffChunk, "uuid">;

export interface UnoptimizedSnapshotChunk extends BaseSnapshot {
  chunkType: "snapshot";
  snapshot: UnoptimizedRootSnapshot;
  initChunk: boolean;
}

export interface SnapshotChunk extends BaseSnapshotWithAssets {
  chunkType: "snapshot";
  snapshot: RootSnapshot;
  initChunk: boolean;
}

export interface DiffChunk extends BaseSnapshotWithAssets {
  chunkType: "diff";
}

export type Asset = Pick<AssetEntity, "id" | "origUrl" | "proxyPath">

export interface BaseSnapshotWithAssets extends BaseSnapshot {
  assets: Asset[];
}

export type BaseSnapshot = Pick<ChunkEntity, "uuid" | "initChunk" | "changes" | "inputs"> & {
  startTime: number;
  endTime: number;
};

export interface UnoptimizedRootSnapshot {
  documentMetadata: DocumentMetadata;
  root: ScrapedHtmlElement;
}

export interface RootSnapshot {
  documentMetadata: DocumentMetadata;
  root: OptimizedHtmlElementInfo;
}

export interface DocumentMetadata {
  docType: string;
  url: LocationMetadata;
  viewportHeight: number;
  viewportWidth: number;
}

export interface LocationMetadata {
  protocol: string;
  hostname: string;
  port: string;
  path: string;
}

export interface OptimizedStyleRule {
  text: string;
  references?: number[];
}

export interface OptimizedHtmlElementInfo {
  type: "element";
  id: number;
  value?: string | number;
  tag: string;
  attributes?: ScrapedAttribute[];
  children: OptimizedElement[];
}

export interface OptimizedStyleElement extends OptimizedHtmlElementInfo {
  tag: "style";
  rules: OptimizedStyleRule[];
}

export interface OptimizedTextElementInfo {
  type: "text";
  id: number;
  content: string;
}

export interface RecordedMutationGroup {
  timestamp: number;
  mutations: OptimizedMutation[];
}

export type RecordedMutation = AttributeMutation | ChangeChildrenMutation | ChangeTextMutation;

export type OptimizedMutation = AttributeMutation | OptimizedChildrenMutation | ChangeTextMutation;

export interface BaseMutation {
  target: number;
}

export interface AttributeMutation extends BaseMutation {
  type: "attribute";
  attribute: ScrapedAttribute;
}

export interface OptimizedChildrenMutation extends BaseMutation {
  type: "children";
  additions?: AddDescriptor[];
  removals?: number[];
}

export interface ChangeChildrenMutation extends BaseMutation {
  type: "children";
  additions: AddDescriptor[];
  removals: ScrapedElement[];
}

export interface AddDescriptor {
  before: number | null;
  data: ScrapedElement;
}

export interface ChangeTextMutation extends BaseMutation {
  type: "change-text";
  update: string;
}

export interface ViewportSize {
  height: number;
  width: number;
}

export type SiteTarget = Pick<TargetEntity, "id" | "name" | "customerId">

export type NewSiteTarget = Omit<SiteTarget, "id">;

export interface RecordingElasticRep {
  recording: string;
  urls: string[];
  userAgent: string;
  start: number;
  site: string;
}
