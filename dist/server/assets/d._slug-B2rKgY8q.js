import { jsx, jsxs } from "react/jsx-runtime";
import { HandCoins } from "lucide-react";
const SplitNotFoundComponent = () => /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center p-6 text-center", children: /* @__PURE__ */ jsxs("div", { children: [
  /* @__PURE__ */ jsx(HandCoins, { className: "h-10 w-10 mx-auto text-muted-foreground" }),
  /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold mt-3", children: "Página de doações não encontrada" })
] }) });
export {
  SplitNotFoundComponent as notFoundComponent
};
