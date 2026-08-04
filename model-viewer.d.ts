import type { ModelViewerElement } from "@google/model-viewer";
import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ModelViewerAttributes = DetailedHTMLProps<
  HTMLAttributes<ModelViewerElement>,
  ModelViewerElement
> & {
  src?: string;
  poster?: string;
  alt?: string;
  loading?: "auto" | "lazy" | "eager";
  reveal?: "auto" | "interaction" | "manual";
  exposure?: string | number;
  "camera-controls"?: boolean;
  "auto-rotate"?: boolean;
  "auto-rotate-delay"?: string | number;
  "rotation-per-second"?: string;
  "camera-orbit"?: string;
  "min-camera-orbit"?: string;
  "max-camera-orbit"?: string;
  "field-of-view"?: string;
  "min-field-of-view"?: string;
  "max-field-of-view"?: string;
  "shadow-intensity"?: string | number;
  "shadow-softness"?: string | number;
  "environment-image"?: string;
  "interaction-prompt"?: "auto" | "when-focused" | "none";
  "touch-action"?: string;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerAttributes;
    }
  }
}

export {};
