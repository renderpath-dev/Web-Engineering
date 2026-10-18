export interface LegacyRenderFunctionShape {
  readonly topic: string;
  readonly legacyPattern: string;
  readonly modernTarget: string;
}

export const legacyRenderFunctionShapes: ReadonlyArray<LegacyRenderFunctionShape> = [
  {
    topic: "h-argument",
    legacyPattern: "render receives h as an argument",
    modernTarget: "import h from vue in the render owner",
  },
  {
    topic: "scoped-slots",
    legacyPattern: "scopedSlots object is passed through VNode data",
    modernTarget: "children are slot functions",
  },
  {
    topic: "vnode-lifecycle",
    legacyPattern: "hook insert and destroy are nested in VNode data",
    modernTarget: "onVnodeMounted and onVnodeUnmounted props",
  },
];
