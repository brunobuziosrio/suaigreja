import { jsxs, jsx } from "react/jsx-runtime";
import * as React from "react";
import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-D8DF8Lur.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { L as Label } from "./label-JU3yqRBo.js";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { c as cn } from "./utils-H80jjgLf.js";
const Slider = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs(
  SliderPrimitive.Root,
  {
    ref,
    className: cn("relative flex w-full touch-none select-none items-center", className),
    ...props,
    children: [
      /* @__PURE__ */ jsx(SliderPrimitive.Track, { className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20", children: /* @__PURE__ */ jsx(SliderPrimitive.Range, { className: "absolute h-full bg-primary" }) }),
      /* @__PURE__ */ jsx(SliderPrimitive.Thumb, { className: "block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" })
    ]
  }
));
Slider.displayName = SliderPrimitive.Root.displayName;
async function getCroppedBlob(imageSrc, area, mime = "image/jpeg") {
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = imageSrc;
  });
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(area.width);
  canvas.height = Math.round(area.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);
  return new Promise(
    (resolve, reject) => canvas.toBlob((b) => b ? resolve(b) : reject(new Error("crop failed")), mime, 0.9)
  );
}
function ImageCropDialog({
  open,
  imageSrc,
  aspect = 2,
  onCancel,
  onConfirm
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState(null);
  const onComplete = useCallback((_, px) => setArea(px), []);
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: (v) => !v && onCancel(), children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-xl", children: [
    /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Ajustar imagem" }) }),
    /* @__PURE__ */ jsx("div", { className: "relative w-full h-[360px] bg-black rounded", children: imageSrc && /* @__PURE__ */ jsx(
      Cropper,
      {
        image: imageSrc,
        crop,
        zoom,
        aspect,
        onCropChange: setCrop,
        onZoomChange: setZoom,
        onCropComplete: onComplete
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { children: "Zoom" }),
      /* @__PURE__ */ jsx(Slider, { value: [zoom], min: 1, max: 3, step: 0.01, onValueChange: (v) => setZoom(v[0]) })
    ] }),
    /* @__PURE__ */ jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: onCancel, children: "Cancelar" }),
      /* @__PURE__ */ jsx(
        Button,
        {
          onClick: async () => {
            if (!imageSrc || !area) return;
            const blob = await getCroppedBlob(imageSrc, area);
            onConfirm(blob);
          },
          children: "Usar imagem"
        }
      )
    ] })
  ] }) });
}
export {
  ImageCropDialog as I
};
