import { jsx, jsxs } from "react/jsx-runtime";
import { Users } from "lucide-react";
const SplitNotFoundComponent = () => /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center p-6 text-center", children: /* @__PURE__ */ jsxs("div", { children: [
  /* @__PURE__ */ jsx(Users, { className: "h-10 w-10 mx-auto text-muted-foreground" }),
  /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold mt-3", children: "Carteirinha não encontrada" }),
  /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "O link pode estar incorreto ou o membro foi removido." })
] }) });
export {
  SplitNotFoundComponent as notFoundComponent
};
