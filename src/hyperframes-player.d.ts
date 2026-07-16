import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "hyperframes-player": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          src?: string;
          width?: number | string;
          height?: number | string;
          autoplay?: boolean;
          loop?: boolean;
          muted?: boolean;
          controls?: boolean;
          poster?: string;
        },
        HTMLElement
      >;
    }
  }
}

export {};
