import { MapTo, Without } from "../../common/utils/type-utils";
import { RecordedKeyEvent } from './events';

const keyup = 'keyup';
const keydown = 'keydown';

export interface RecordedInputChangeEvent extends BaseUserInput {
    type: 'input' | 'change',
    target: number;
    value: string | boolean;
}

export interface RecordedKeyUp extends BaseKeyEvent {
    type: typeof keyup
}

export interface RecordedKeyDown extends BaseKeyEvent {
    type: typeof keydown;
}

interface BaseKeyEvent extends BaseUserInput {
    key: string;
}

export type RecordedMouseEvent = RecordedMouseMove | RecordedMouseButton;

export interface RecordedMouseMove extends BaseMouseEvent {
    type: 'mousemove';
}

export interface RecordedMouseButton extends BaseMouseEvent {
    type: 'mouseup' | 'mousedown';
    button: number;
    buttonDown: boolean;
}

export interface BaseMouseEvent extends BaseUserInput {
    hovered?: number;
    x: number;
    y: number;
}

export interface RecordedResize extends BaseUserInput {
    type: 'resize';
    height: number;
    width: number;
}

export interface RecordedScrollEvent extends BaseUserInput {
    type: 'scroll';
    target: number | null;
    scrollX: number;
    scrollY: number;
}

export type ScrapedElement = ScrapedHtmlElement | ScrapedTextElement;
export type OptimizedElement = OptimizedHtmlElementInfo | OptimizedTextElementInfo;

export interface ScrapedHtmlElement extends OptimizedHtmlElementInfo {
    domElement: Element;
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

export type ScrapedStyleRule = ScrapedMediaRule | ScrapedFontFaceRule | ScrapedSupportsRule | BasicRule | ImportRule | KeyframesRule;

export interface ScrapedMediaRule extends BaseScrapedRule {
    conditions: string[];
    type: 'media';
}

export interface ScrapedFontFaceRule extends BaseScrapedRule {
    src: string;
    type: 'font-face';
}

export interface ScrapedSupportsRule extends BaseScrapedRule {
    condition: string;
    type: 'supports';
}

export interface ImportRule extends BaseScrapedRule {
    conditions: string[];
    src: string;
    type: 'import';
}

export interface BasicRule extends BaseScrapedRule {
    type: 'style';
    selector: string;
}

export interface KeyframesRule extends BaseScrapedRule {
    type: 'keyframe';
}

interface BaseScrapedRule {
    text: string;
    source?: string;
    references?: string[];
}

export interface RecordingOverview {
    _id: string;
    metadata: RecordingMetadata;
    thumbnail?: string;
    chunks: ChunkOverview[];
    finalized?: boolean
}

export interface ChunkOverview {
    _id: string;
    type: 'snapshot' | 'diff';
    metadata: ChunkMetadata
}

export interface Recording extends RecordingOverview {
    _id: string;
    metadata: RecordingMetadata;
    chunks: RecordingChunk[];
}

export interface RecordingMetadata {
    startTime: number;
    duration: number;
    site: string;
    uaDetails: UADetails;
}

export interface UADetails {
    browser: {
        name: string;
    };

    os: {
        name: string;
    }

    device: {
        vendor: string;
    }
}

export type RecordingChunk = SnapshotChunk | DiffChunk;

export interface UnoptimizedSnapshotChunk extends BaseSnapshot {
    type: 'snapshot';
    snapshot: UnoptimizedRootSnapshot
}

export type PendingSnapshotChunk = Without<SnapshotChunk, "_id">
export type PendingDiffChunk = Without<DiffChunk, "_id">

export interface SnapshotChunk extends BaseSnapshotWithAssets {
    type: 'snapshot';
    snapshot: RootSnapshot;
}

export interface DiffChunk extends BaseSnapshotWithAssets {
    type: 'diff';
}

export interface BaseSnapshotWithAssets extends BaseSnapshot {
    _id: string;
    assets: string[];
}

export interface BaseSnapshot {
    metadata: ChunkMetadata;
    changes: RecordedMutationGroup[];
    inputs: RecordedInputChannels;
}

export interface RootSnapshot {
    documentMetadata: DocumentMetadata;
    root: OptimizedHtmlElementInfo;
}

export interface UnoptimizedRootSnapshot {
    documentMetadata: DocumentMetadata;
    root: ScrapedHtmlElement;
}

export interface DocumentMetadata {
    docType: string;
    url: LocationMetadata;
    viewportHeight: number;
    viewportWidth: number;
}

export interface ChunkMetadata {
    startTime: number;
    stopTime: number; 
}

export interface LocationMetadata {
    protocol: string;
    hostname: string;
    port: string;
    path: string;
}

export type RecordedInputChannels = MapTo<RecordedUserInput[]>;

export interface OptimizedStyleRule {
    text: string;
    references?: number[];
}

export interface OptimizedHtmlElementInfo {
    type: 'element';
    id: number;
    value?: string | number;
    tag: string;
    attributes?: ScrapedAttribute[];
    children: OptimizedElement[];
}

export interface OptimizedStyleElement extends OptimizedHtmlElementInfo {
    tag: 'style';
    rules: OptimizedStyleRule[]
}

export interface OptimizedTextElementInfo {
    type: 'text',
    id: number;
    content: string;
}

export type RecordedUserInput = RecordedMouseEvent | RecordedScrollEvent | RecordedInputChangeEvent
                                 | RecordedFocusEvent | RecordedResize | RecordedKeyEvent

export interface BaseUserInput {
    timestamp: number;
    type: string;
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
    type: 'attribute',
    name: string;
    val: string;
}

export interface OptimizedChildrenMutation extends BaseMutation {
    type: 'children',
    additions?: AddDescriptor[];
    removals?: number[];
}

export interface ChangeChildrenMutation extends BaseMutation {
    type: 'children';
    additions: AddDescriptor[];
    removals: ScrapedElement[];
}

export interface AddDescriptor {
    before: number | null;
    data: ScrapedElement;
}

export interface ChangeTextMutation extends BaseMutation {
    type: 'change-text';
    update: string;
}

export interface RecordedFocusEvent extends BaseUserInput {
    type: 'focus' | 'blur';
    target?: number;
}