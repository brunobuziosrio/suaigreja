import { jsx, jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useState } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { X, PanelLeft, CalendarDays, CalendarHeart, Radio, QrCode, IdCard, UserPlus, Users2, HandHeart, GraduationCap, BookOpen, FileText, Store, WalletCards, MapPin, ListChecks, Code2, Settings, LayoutDashboard, BarChart3, Globe, ChevronDown, Image, LayoutTemplate, Sparkle, MessageSquareQuote, Newspaper, Eye, Share2, HandCoins, Users, BookOpenCheck, MessageCircle, ShieldCheck, Package, Megaphone, LogOut } from "lucide-react";
import { c as cn } from "./utils-H80jjgLf.js";
import { B as Button } from "./button-Bt6uLOVU.js";
import { I as Input } from "./input-DAQqOwjK.js";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { useRouterState, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { c as createSsrRpc } from "./admin-payment-settings.functions-DESQQOGp.js";
import { e as createServerFn } from "./server-D1UATaaE.js";
import { r as requireSupabaseAuth } from "./auth-middleware-DAGjxCX9.js";
import { z } from "zod";
import { u as useAuth } from "./router-DXfKo2Q8.js";
import { s as supabase } from "./client-DVtn2Z4s.js";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
const MOBILE_BREAKPOINT = 768;
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(void 0);
  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
}
const Separator = React.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ jsx(
  SeparatorPrimitive.Root,
  {
    ref,
    decorative,
    orientation,
    className: cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      className
    ),
    ...props
  }
));
Separator.displayName = SeparatorPrimitive.Root.displayName;
const Sheet = DialogPrimitive.Root;
const SheetPortal = DialogPrimitive.Portal;
const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;
const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
);
const SheetContent = React.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxs(SheetPortal, { children: [
  /* @__PURE__ */ jsx(SheetOverlay, {}),
  /* @__PURE__ */ jsxs(DialogPrimitive.Content, { ref, className: cn(sheetVariants({ side }), className), ...props, children: [
    /* @__PURE__ */ jsxs(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary", children: [
      /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
    ] }),
    children
  ] })
] }));
SheetContent.displayName = DialogPrimitive.Content.displayName;
const SheetHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props });
SheetHeader.displayName = "SheetHeader";
const SheetTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold text-foreground", className),
    ...props
  }
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;
const SheetDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;
function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("animate-pulse rounded-md bg-primary/10", className), ...props });
}
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(TooltipPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  TooltipPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-tooltip-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
const SidebarContext = React.createContext(null);
function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}
const SidebarProvider = React.forwardRef(
  ({
    defaultOpen = true,
    open: openProp,
    onOpenChange: setOpenProp,
    className,
    style,
    children,
    ...props
  }, ref) => {
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = React.useState(false);
    const [_open, _setOpen] = React.useState(defaultOpen);
    const open = openProp ?? _open;
    const setOpen = React.useCallback(
      (value) => {
        const openState = typeof value === "function" ? value(open) : value;
        if (setOpenProp) {
          setOpenProp(openState);
        } else {
          _setOpen(openState);
        }
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      },
      [setOpenProp, open]
    );
    const toggleSidebar = React.useCallback(() => {
      return isMobile ? setOpenMobile((open2) => !open2) : setOpen((open2) => !open2);
    }, [isMobile, setOpen, setOpenMobile]);
    React.useEffect(() => {
      const handleKeyDown = (event) => {
        if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          toggleSidebar();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleSidebar]);
    const state = open ? "expanded" : "collapsed";
    const contextValue = React.useMemo(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    );
    return /* @__PURE__ */ jsx(SidebarContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsx(TooltipProvider, { delayDuration: 0, children: /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          "--sidebar-width": SIDEBAR_WIDTH,
          "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
          ...style
        },
        className: cn(
          "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
          className
        ),
        ref,
        ...props,
        children
      }
    ) }) });
  }
);
SidebarProvider.displayName = "SidebarProvider";
const Sidebar = React.forwardRef(
  ({
    side = "left",
    variant = "sidebar",
    collapsible = "offcanvas",
    className,
    children,
    ...props
  }, ref) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
    if (collapsible === "none") {
      return /* @__PURE__ */ jsx(
        "div",
        {
          className: cn(
            "flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",
            className
          ),
          ref,
          ...props,
          children
        }
      );
    }
    if (isMobile) {
      return /* @__PURE__ */ jsx(Sheet, { open: openMobile, onOpenChange: setOpenMobile, ...props, children: /* @__PURE__ */ jsxs(
        SheetContent,
        {
          "data-sidebar": "sidebar",
          "data-mobile": "true",
          className: "w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden",
          style: {
            "--sidebar-width": SIDEBAR_WIDTH_MOBILE
          },
          side,
          children: [
            /* @__PURE__ */ jsxs(SheetHeader, { className: "sr-only", children: [
              /* @__PURE__ */ jsx(SheetTitle, { children: "Sidebar" }),
              /* @__PURE__ */ jsx(SheetDescription, { children: "Displays the mobile sidebar." })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex h-full w-full flex-col", children })
          ]
        }
      ) });
    }
    return /* @__PURE__ */ jsxs(
      "div",
      {
        ref,
        className: "group peer hidden text-sidebar-foreground md:block",
        "data-state": state,
        "data-collapsible": state === "collapsed" ? collapsible : "",
        "data-variant": variant,
        "data-side": side,
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: cn(
                "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
                "group-data-[collapsible=offcanvas]:w-0",
                "group-data-[side=right]:rotate-180",
                variant === "floating" || variant === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
              )
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: cn(
                "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
                side === "left" ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]" : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
                // Adjust the padding for floating and inset variants.
                variant === "floating" || variant === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
                className
              ),
              ...props,
              children: /* @__PURE__ */ jsx(
                "div",
                {
                  "data-sidebar": "sidebar",
                  className: "flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow",
                  children
                }
              )
            }
          )
        ]
      }
    );
  }
);
Sidebar.displayName = "Sidebar";
const SidebarTrigger = React.forwardRef(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();
  return /* @__PURE__ */ jsxs(
    Button,
    {
      ref,
      "data-sidebar": "trigger",
      variant: "ghost",
      size: "icon",
      className: cn("h-7 w-7", className),
      onClick: (event) => {
        onClick?.(event);
        toggleSidebar();
      },
      ...props,
      children: [
        /* @__PURE__ */ jsx(PanelLeft, {}),
        /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Toggle Sidebar" })
      ]
    }
  );
});
SidebarTrigger.displayName = "SidebarTrigger";
const SidebarRail = React.forwardRef(
  ({ className, ...props }, ref) => {
    const { toggleSidebar } = useSidebar();
    return /* @__PURE__ */ jsx(
      "button",
      {
        ref,
        "data-sidebar": "rail",
        "aria-label": "Toggle Sidebar",
        tabIndex: -1,
        onClick: toggleSidebar,
        title: "Toggle Sidebar",
        className: cn(
          "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
          "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
          "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
          "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
          "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
          "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
          className
        ),
        ...props
      }
    );
  }
);
SidebarRail.displayName = "SidebarRail";
const SidebarInset = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "main",
      {
        ref,
        className: cn(
          "relative flex w-full flex-1 flex-col bg-background",
          "md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
          className
        ),
        ...props
      }
    );
  }
);
SidebarInset.displayName = "SidebarInset";
const SidebarInput = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    Input,
    {
      ref,
      "data-sidebar": "input",
      className: cn(
        "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        className
      ),
      ...props
    }
  );
});
SidebarInput.displayName = "SidebarInput";
const SidebarHeader = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "div",
      {
        ref,
        "data-sidebar": "header",
        className: cn("flex flex-col gap-2 p-2", className),
        ...props
      }
    );
  }
);
SidebarHeader.displayName = "SidebarHeader";
const SidebarFooter = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "div",
      {
        ref,
        "data-sidebar": "footer",
        className: cn("flex flex-col gap-2 p-2", className),
        ...props
      }
    );
  }
);
SidebarFooter.displayName = "SidebarFooter";
const SidebarSeparator = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    Separator,
    {
      ref,
      "data-sidebar": "separator",
      className: cn("mx-2 w-auto bg-sidebar-border", className),
      ...props
    }
  );
});
SidebarSeparator.displayName = "SidebarSeparator";
const SidebarContent = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "div",
      {
        ref,
        "data-sidebar": "content",
        className: cn(
          "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
          className
        ),
        ...props
      }
    );
  }
);
SidebarContent.displayName = "SidebarContent";
const SidebarGroup = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "div",
      {
        ref,
        "data-sidebar": "group",
        className: cn("relative flex w-full min-w-0 flex-col p-2", className),
        ...props
      }
    );
  }
);
SidebarGroup.displayName = "SidebarGroup";
const SidebarGroupLabel = React.forwardRef(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      ref,
      "data-sidebar": "group-label",
      className: cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      ),
      ...props
    }
  );
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";
const SidebarGroupAction = React.forwardRef(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      ref,
      "data-sidebar": "group-action",
      className: cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring cursor-pointer transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  );
});
SidebarGroupAction.displayName = "SidebarGroupAction";
const SidebarGroupContent = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      "data-sidebar": "group-content",
      className: cn("w-full text-sm", className),
      ...props
    }
  )
);
SidebarGroupContent.displayName = "SidebarGroupContent";
const SidebarMenu = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    "ul",
    {
      ref,
      "data-sidebar": "menu",
      className: cn("flex w-full min-w-0 flex-col gap-1", className),
      ...props
    }
  )
);
SidebarMenu.displayName = "SidebarMenu";
const SidebarMenuItem = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    "li",
    {
      ref,
      "data-sidebar": "menu-item",
      className: cn("group/menu-item relative", className),
      ...props
    }
  )
);
SidebarMenuItem.displayName = "SidebarMenuItem";
const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring cursor-pointer transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline: "bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]"
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const SidebarMenuButton = React.forwardRef(
  ({
    asChild = false,
    isActive = false,
    variant = "default",
    size = "default",
    tooltip,
    className,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    const { isMobile, state } = useSidebar();
    const button = /* @__PURE__ */ jsx(
      Comp,
      {
        ref,
        "data-sidebar": "menu-button",
        "data-size": size,
        "data-active": isActive,
        className: cn(sidebarMenuButtonVariants({ variant, size }), className),
        ...props
      }
    );
    if (!tooltip) {
      return button;
    }
    if (typeof tooltip === "string") {
      tooltip = {
        children: tooltip
      };
    }
    return /* @__PURE__ */ jsxs(Tooltip, { children: [
      /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: button }),
      /* @__PURE__ */ jsx(
        TooltipContent,
        {
          side: "right",
          align: "center",
          hidden: state !== "collapsed" || isMobile,
          ...tooltip
        }
      )
    ] });
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";
const SidebarMenuAction = React.forwardRef(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      ref,
      "data-sidebar": "menu-action",
      className: cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring cursor-pointer transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover && "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className
      ),
      ...props
    }
  );
});
SidebarMenuAction.displayName = "SidebarMenuAction";
const SidebarMenuBadge = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      "data-sidebar": "menu-badge",
      className: cn(
        "pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  )
);
SidebarMenuBadge.displayName = "SidebarMenuBadge";
const SidebarMenuSkeleton = React.forwardRef(({ className, showIcon = false, ...props }, ref) => {
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref,
      "data-sidebar": "menu-skeleton",
      className: cn("flex h-8 items-center gap-2 rounded-md px-2", className),
      ...props,
      children: [
        showIcon && /* @__PURE__ */ jsx(Skeleton, { className: "size-4 rounded-md", "data-sidebar": "menu-skeleton-icon" }),
        /* @__PURE__ */ jsx(
          Skeleton,
          {
            className: "h-4 max-w-(--skeleton-width) flex-1",
            "data-sidebar": "menu-skeleton-text",
            style: {
              "--skeleton-width": width
            }
          }
        )
      ]
    }
  );
});
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";
const SidebarMenuSub = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    "ul",
    {
      ref,
      "data-sidebar": "menu-sub",
      className: cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  )
);
SidebarMenuSub.displayName = "SidebarMenuSub";
const SidebarMenuSubItem = React.forwardRef(
  ({ ...props }, ref) => /* @__PURE__ */ jsx("li", { ref, ...props })
);
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";
const SidebarMenuSubButton = React.forwardRef(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      ref,
      "data-sidebar": "menu-sub-button",
      "data-size": size,
      "data-active": isActive,
      className: cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  );
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";
const getIsAdmin = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("8ec3a24cdfc816c6a99237bbadf5c75ae0affc14e8a68ec0663a4f7dc5edbfa9"));
const listAllAccounts = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("9baedc754f9abe6e0bc74138ec477e275590543cb6654601d0cf125fb2c54170"));
const updateSchema = z.object({
  account_id: z.string().uuid(),
  subscription_status: z.enum(["trial", "active", "past_due", "canceled"])
});
const updateAccountSubscription = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => updateSchema.parse(input)).handler(createSsrRpc("3edb9c95c6e958d143255a04b67bef1ed75f9aa86a06db65952928fc39691d81"));
const nameSchema = z.object({
  account_id: z.string().uuid(),
  brand_title: z.string().trim().min(1, "Nome obrigatório").max(120)
});
const adminUpdateAccountName = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => nameSchema.parse(input)).handler(createSsrRpc("b4008e1dab8f405a0e12078ac68dda98a239edaa35fe1f8bfee30adaea9274ba"));
const generateTestDataSchema = z.object({
  account_id: z.string().uuid()
});
const generateTestData = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => generateTestDataSchema.parse(input)).handler(createSsrRpc("7822ffc6547e06ca58edd006cd4a93f7f73629aab0483330b41f6096fd04724a"));
const deleteTestDataSchema = z.object({
  account_id: z.string().uuid()
});
const deleteTestData = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => deleteTestDataSchema.parse(input)).handler(createSsrRpc("cfcdf74e97663be5fef33a1032891954031b66716f063dbd46be989c49a205e2"));
const countTestData = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("0ca46ef0a035843e32280cb461ffa894fc39dcbaec8aa25e4a7f94cbdc5ca058"));
const DEFAULTS = {
  brand_text: "suaigreja",
  subtitle: "painel",
  icon_text: "s",
  icon_url: null,
  logo_url: null,
  logo_height_px: 32
};
function useBranding() {
  return useQuery({
    queryKey: ["platform-branding"],
    queryFn: async () => {
      const { data, error } = await supabase.from("platform_branding").select("brand_text, subtitle, icon_text, icon_url, logo_url, logo_height_px").eq("id", true).maybeSingle();
      if (error) throw error;
      return data ?? DEFAULTS;
    },
    staleTime: 6e4
  });
}
const BRANDING_DEFAULTS = DEFAULTS;
const Collapsible = CollapsiblePrimitive.Root;
const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;
const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;
const hubSubItems = [
  { tab: "geral", title: "Geral", icon: Settings },
  { tab: "aparencia", title: "Galeria", icon: Image },
  { tab: "slides", title: "Slides", icon: LayoutTemplate },
  { tab: "destaques", title: "Destaques", icon: Sparkle },
  { tab: "mensagem", title: "Mensagem da semana", icon: MessageSquareQuote },
  { tab: "noticias", title: "Notícias", icon: Newspaper },
  { tab: "secoes", title: "Seções visíveis", icon: Eye },
  { tab: "contatos", title: "Contatos & Redes", icon: Share2 },
  { tab: "doacoes", title: "Doações (Pix)", icon: HandCoins }
];
const agendaItems = [
  { title: "Agenda", url: "/agenda", icon: CalendarDays },
  { title: "Eventos", url: "/eventos", icon: CalendarHeart },
  { title: "Transmissões", url: "/transmissoes", icon: Radio },
  { title: "Check-in de Cultos", url: "/checkin", icon: QrCode }
];
const peopleItems = [
  { title: "Membros", url: "/membros", icon: IdCard },
  { title: "Visitantes", url: "/visitantes", icon: UserPlus },
  { title: "Pequenos Grupos / Células", url: "/celulas", icon: Users2 },
  { title: "Pedidos de Oração", url: "/oracoes", icon: HandHeart }
];
const teachingItems = [
  { title: "EBD / Escola Bíblica", url: "/ebd", icon: GraduationCap },
  { title: "Devocional Diário", url: "/devocional", icon: BookOpen },
  { title: "Documentos", url: "/documentos", icon: FileText }
];
const storeItems = [
  { title: "Plugins & Extras", url: "/marketplace", icon: Store },
  { title: "Assinatura", url: "/billing", icon: WalletCards }
];
const configItems = [
  { title: "Locais", url: "/locations", icon: MapPin },
  { title: "Tipos de evento", url: "/types", icon: ListChecks },
  { title: "Embed & Integrações", url: "/embed", icon: Code2 },
  { title: "Configurações gerais", url: "/settings", icon: Settings }
];
function AppSidebar() {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const currentSearch = useRouterState({ select: (s) => s.location.search });
  const currentHubTab = currentSearch?.tab ?? "geral";
  const { user } = useAuth();
  const checkAdmin = useServerFn(getIsAdmin);
  const { data: adminCheck } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkAdmin(),
    enabled: !!user
  });
  const isAdmin = !!adminCheck?.isAdmin;
  const { data: brandingData } = useBranding();
  const branding = brandingData ?? BRANDING_DEFAULTS;
  const [iconError, setIconError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const isInHub = currentPath === "/hub";
  const isInAgenda = agendaItems.some((i) => currentPath === i.url);
  const isInPeople = peopleItems.some((i) => currentPath === i.url);
  const isInTeaching = teachingItems.some((i) => currentPath === i.url);
  const isInStore = storeItems.some((i) => currentPath === i.url);
  const isInConfig = configItems.some((i) => currentPath === i.url);
  const isInAdmin = currentPath.startsWith("/admin");
  return /* @__PURE__ */ jsxs(Sidebar, { collapsible: "icon", children: [
    /* @__PURE__ */ jsx(SidebarHeader, { className: "border-b border-sidebar-border px-3 py-3 group-data-[collapsible=icon]:px-2", children: /* @__PURE__ */ jsxs(Link, { to: "/dashboard", className: "flex items-center gap-2 min-w-0", children: [
      branding.icon_url && !iconError ? /* @__PURE__ */ jsx(
        "img",
        {
          src: branding.icon_url,
          alt: "",
          className: "h-8 w-8 shrink-0 rounded-md object-cover shadow-sm",
          onError: () => setIconError(true)
        }
      ) : /* @__PURE__ */ jsx(
        "span",
        {
          "aria-hidden": true,
          className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-sidebar-primary to-sand text-sidebar-primary-foreground font-bold text-sm shadow-sm",
          children: branding.icon_text
        }
      ),
      /* @__PURE__ */ jsxs("span", { className: "flex flex-col leading-tight group-data-[collapsible=icon]:hidden min-w-0", children: [
        branding.logo_url && !logoError ? /* @__PURE__ */ jsx(
          "img",
          {
            src: branding.logo_url,
            alt: branding.brand_text,
            style: { height: branding.logo_height_px },
            className: "w-auto object-contain",
            onError: () => setLogoError(true)
          }
        ) : /* @__PURE__ */ jsx("span", { className: "font-display text-base font-semibold tracking-tight text-sidebar-foreground truncate", children: branding.brand_text }),
        branding.subtitle && /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-[0.15em] text-muted-foreground", children: branding.subtitle })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs(SidebarContent, { children: [
      /* @__PURE__ */ jsxs(SidebarGroup, { children: [
        /* @__PURE__ */ jsx(SidebarGroupLabel, { children: "Visão geral" }),
        /* @__PURE__ */ jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsxs(SidebarMenu, { children: [
          /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsx(SidebarMenuButton, { asChild: true, isActive: currentPath === "/dashboard", children: /* @__PURE__ */ jsxs(Link, { to: "/dashboard", className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(LayoutDashboard, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx("span", { children: "Dashboard" })
          ] }) }) }),
          /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsx(SidebarMenuButton, { asChild: true, isActive: currentPath === "/relatorios", children: /* @__PURE__ */ jsxs(Link, { to: "/relatorios", className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(BarChart3, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx("span", { children: "Relatórios" })
          ] }) }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(SidebarGroup, { children: [
        /* @__PURE__ */ jsx(SidebarGroupLabel, { children: "Página da Igreja" }),
        /* @__PURE__ */ jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsx(SidebarMenu, { children: /* @__PURE__ */ jsx(Collapsible, { defaultOpen: isInHub, className: "group/collapse", children: /* @__PURE__ */ jsxs(SidebarMenuItem, { children: [
          /* @__PURE__ */ jsx(CollapsibleTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(SidebarMenuButton, { isActive: isInHub, className: "w-full", children: [
            /* @__PURE__ */ jsx(Globe, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx("span", { children: "Seções do site" }),
            /* @__PURE__ */ jsx(ChevronDown, { className: "ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapse:rotate-180" })
          ] }) }),
          /* @__PURE__ */ jsx(CollapsibleContent, { children: /* @__PURE__ */ jsx(SidebarMenuSub, { children: hubSubItems.map((sub) => /* @__PURE__ */ jsx(SidebarMenuSubItem, { children: /* @__PURE__ */ jsx(
            SidebarMenuSubButton,
            {
              asChild: true,
              isActive: isInHub && currentHubTab === sub.tab,
              children: /* @__PURE__ */ jsxs(
                Link,
                {
                  to: "/hub",
                  search: { tab: sub.tab === "geral" ? void 0 : sub.tab },
                  className: "flex items-center gap-2",
                  children: [
                    /* @__PURE__ */ jsx(sub.icon, { className: "h-3.5 w-3.5" }),
                    /* @__PURE__ */ jsx("span", { children: sub.title })
                  ]
                }
              )
            }
          ) }, sub.tab)) }) })
        ] }) }) }) })
      ] }),
      /* @__PURE__ */ jsxs(SidebarGroup, { children: [
        /* @__PURE__ */ jsx(SidebarGroupLabel, { children: "Agenda & Eventos" }),
        /* @__PURE__ */ jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsx(SidebarMenu, { children: /* @__PURE__ */ jsx(Collapsible, { defaultOpen: isInAgenda, className: "group/collapse", children: /* @__PURE__ */ jsxs(SidebarMenuItem, { children: [
          /* @__PURE__ */ jsx(CollapsibleTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(SidebarMenuButton, { isActive: isInAgenda, className: "w-full", children: [
            /* @__PURE__ */ jsx(CalendarDays, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx("span", { children: "Agenda & Eventos" }),
            /* @__PURE__ */ jsx(ChevronDown, { className: "ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapse:rotate-180" })
          ] }) }),
          /* @__PURE__ */ jsx(CollapsibleContent, { children: /* @__PURE__ */ jsx(SidebarMenuSub, { children: agendaItems.map((sub) => /* @__PURE__ */ jsx(SidebarMenuSubItem, { children: /* @__PURE__ */ jsx(SidebarMenuSubButton, { asChild: true, isActive: currentPath === sub.url, children: /* @__PURE__ */ jsxs(Link, { to: sub.url, className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(sub.icon, { className: "h-3.5 w-3.5" }),
            /* @__PURE__ */ jsx("span", { children: sub.title })
          ] }) }) }, sub.url)) }) })
        ] }) }) }) })
      ] }),
      /* @__PURE__ */ jsxs(SidebarGroup, { children: [
        /* @__PURE__ */ jsx(SidebarGroupLabel, { children: "Pessoas" }),
        /* @__PURE__ */ jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsx(SidebarMenu, { children: /* @__PURE__ */ jsx(Collapsible, { defaultOpen: isInPeople, className: "group/collapse", children: /* @__PURE__ */ jsxs(SidebarMenuItem, { children: [
          /* @__PURE__ */ jsx(CollapsibleTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(SidebarMenuButton, { isActive: isInPeople, className: "w-full", children: [
            /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx("span", { children: "Pessoas" }),
            /* @__PURE__ */ jsx(ChevronDown, { className: "ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapse:rotate-180" })
          ] }) }),
          /* @__PURE__ */ jsx(CollapsibleContent, { children: /* @__PURE__ */ jsx(SidebarMenuSub, { children: peopleItems.map((sub) => /* @__PURE__ */ jsx(SidebarMenuSubItem, { children: /* @__PURE__ */ jsx(SidebarMenuSubButton, { asChild: true, isActive: currentPath === sub.url, children: /* @__PURE__ */ jsxs(Link, { to: sub.url, className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(sub.icon, { className: "h-3.5 w-3.5" }),
            /* @__PURE__ */ jsx("span", { children: sub.title })
          ] }) }) }, sub.url)) }) })
        ] }) }) }) })
      ] }),
      /* @__PURE__ */ jsxs(SidebarGroup, { children: [
        /* @__PURE__ */ jsx(SidebarGroupLabel, { children: "Ensino & Discipulado" }),
        /* @__PURE__ */ jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsx(SidebarMenu, { children: /* @__PURE__ */ jsx(Collapsible, { defaultOpen: isInTeaching, className: "group/collapse", children: /* @__PURE__ */ jsxs(SidebarMenuItem, { children: [
          /* @__PURE__ */ jsx(CollapsibleTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(SidebarMenuButton, { isActive: isInTeaching, className: "w-full", children: [
            /* @__PURE__ */ jsx(BookOpenCheck, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx("span", { children: "Ensino & Discipulado" }),
            /* @__PURE__ */ jsx(ChevronDown, { className: "ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapse:rotate-180" })
          ] }) }),
          /* @__PURE__ */ jsx(CollapsibleContent, { children: /* @__PURE__ */ jsx(SidebarMenuSub, { children: teachingItems.map((sub) => /* @__PURE__ */ jsx(SidebarMenuSubItem, { children: /* @__PURE__ */ jsx(SidebarMenuSubButton, { asChild: true, isActive: currentPath === sub.url, children: /* @__PURE__ */ jsxs(Link, { to: sub.url, className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(sub.icon, { className: "h-3.5 w-3.5" }),
            /* @__PURE__ */ jsx("span", { children: sub.title })
          ] }) }) }, sub.url)) }) })
        ] }) }) }) })
      ] }),
      /* @__PURE__ */ jsxs(SidebarGroup, { children: [
        /* @__PURE__ */ jsx(SidebarGroupLabel, { children: "Comunicação" }),
        /* @__PURE__ */ jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsx(SidebarMenu, { children: /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsx(SidebarMenuButton, { asChild: true, isActive: currentPath === "/whatsapp", children: /* @__PURE__ */ jsxs(Link, { to: "/whatsapp", className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(MessageCircle, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { children: "WhatsApp" })
        ] }) }) }) }) })
      ] }),
      /* @__PURE__ */ jsxs(SidebarGroup, { children: [
        /* @__PURE__ */ jsx(SidebarGroupLabel, { children: "Loja & Assinatura" }),
        /* @__PURE__ */ jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsx(SidebarMenu, { children: /* @__PURE__ */ jsx(Collapsible, { defaultOpen: isInStore, className: "group/collapse", children: /* @__PURE__ */ jsxs(SidebarMenuItem, { children: [
          /* @__PURE__ */ jsx(CollapsibleTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(SidebarMenuButton, { isActive: isInStore, className: "w-full", children: [
            /* @__PURE__ */ jsx(Store, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx("span", { children: "Loja & Assinatura" }),
            /* @__PURE__ */ jsx(ChevronDown, { className: "ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapse:rotate-180" })
          ] }) }),
          /* @__PURE__ */ jsx(CollapsibleContent, { children: /* @__PURE__ */ jsx(SidebarMenuSub, { children: storeItems.map((sub) => /* @__PURE__ */ jsx(SidebarMenuSubItem, { children: /* @__PURE__ */ jsx(SidebarMenuSubButton, { asChild: true, isActive: currentPath === sub.url, children: /* @__PURE__ */ jsxs(Link, { to: sub.url, className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(sub.icon, { className: "h-3.5 w-3.5" }),
            /* @__PURE__ */ jsx("span", { children: sub.title })
          ] }) }) }, sub.url)) }) })
        ] }) }) }) })
      ] }),
      /* @__PURE__ */ jsxs(SidebarGroup, { children: [
        /* @__PURE__ */ jsx(SidebarGroupLabel, { children: "Configurações da Igreja" }),
        /* @__PURE__ */ jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsx(SidebarMenu, { children: /* @__PURE__ */ jsx(Collapsible, { defaultOpen: isInConfig, className: "group/collapse", children: /* @__PURE__ */ jsxs(SidebarMenuItem, { children: [
          /* @__PURE__ */ jsx(CollapsibleTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(SidebarMenuButton, { isActive: isInConfig, className: "w-full", children: [
            /* @__PURE__ */ jsx(Settings, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx("span", { children: "Configurações" }),
            /* @__PURE__ */ jsx(ChevronDown, { className: "ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapse:rotate-180" })
          ] }) }),
          /* @__PURE__ */ jsx(CollapsibleContent, { children: /* @__PURE__ */ jsx(SidebarMenuSub, { children: configItems.map((sub) => /* @__PURE__ */ jsx(SidebarMenuSubItem, { children: /* @__PURE__ */ jsx(SidebarMenuSubButton, { asChild: true, isActive: currentPath === sub.url, children: /* @__PURE__ */ jsxs(Link, { to: sub.url, className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(sub.icon, { className: "h-3.5 w-3.5" }),
            /* @__PURE__ */ jsx("span", { children: sub.title })
          ] }) }) }, sub.url)) }) })
        ] }) }) }) })
      ] }),
      isAdmin && /* @__PURE__ */ jsxs(SidebarGroup, { children: [
        /* @__PURE__ */ jsx(SidebarGroupLabel, { children: "Administração" }),
        /* @__PURE__ */ jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsx(SidebarMenu, { children: /* @__PURE__ */ jsx(Collapsible, { defaultOpen: isInAdmin, className: "group/collapse", children: /* @__PURE__ */ jsxs(SidebarMenuItem, { children: [
          /* @__PURE__ */ jsx(CollapsibleTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(SidebarMenuButton, { isActive: isInAdmin, className: "w-full", children: [
            /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx("span", { children: "Admin" }),
            /* @__PURE__ */ jsx(ChevronDown, { className: "ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapse:rotate-180" })
          ] }) }),
          /* @__PURE__ */ jsx(CollapsibleContent, { children: /* @__PURE__ */ jsxs(SidebarMenuSub, { children: [
            /* @__PURE__ */ jsx(SidebarMenuSubItem, { children: /* @__PURE__ */ jsx(SidebarMenuSubButton, { asChild: true, isActive: currentPath === "/admin", children: /* @__PURE__ */ jsxs(Link, { to: "/admin", className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Users, { className: "h-3.5 w-3.5" }),
              /* @__PURE__ */ jsx("span", { children: "Contas" })
            ] }) }) }),
            /* @__PURE__ */ jsx(SidebarMenuSubItem, { children: /* @__PURE__ */ jsx(SidebarMenuSubButton, { asChild: true, isActive: currentPath === "/admin/products", children: /* @__PURE__ */ jsxs(Link, { to: "/admin/products", className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Package, { className: "h-3.5 w-3.5" }),
              /* @__PURE__ */ jsx("span", { children: "Produtos" })
            ] }) }) }),
            /* @__PURE__ */ jsx(SidebarMenuSubItem, { children: /* @__PURE__ */ jsx(SidebarMenuSubButton, { asChild: true, isActive: currentPath === "/admin/feedback", children: /* @__PURE__ */ jsxs(Link, { to: "/admin/feedback", className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Megaphone, { className: "h-3.5 w-3.5" }),
              /* @__PURE__ */ jsx("span", { children: "Atualizações & Sugestões" })
            ] }) }) }),
            /* @__PURE__ */ jsx(SidebarMenuSubItem, { children: /* @__PURE__ */ jsx(SidebarMenuSubButton, { asChild: true, isActive: currentPath === "/admin/payments", children: /* @__PURE__ */ jsxs(Link, { to: "/admin/payments", className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(WalletCards, { className: "h-3.5 w-3.5" }),
              /* @__PURE__ */ jsx("span", { children: "Pagamentos da plataforma" })
            ] }) }) })
          ] }) })
        ] }) }) }) })
      ] })
    ] })
  ] });
}
function AppShell({ children }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxs(SidebarProvider, { children: [
    /* @__PURE__ */ jsx(AppSidebar, {}),
    /* @__PURE__ */ jsxs(SidebarInset, { children: [
      /* @__PURE__ */ jsxs("header", { className: "flex h-14 shrink-0 items-center justify-between border-b border-outline bg-background px-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(SidebarTrigger, {}),
          /* @__PURE__ */ jsx(Separator, { orientation: "vertical", className: "h-4 mx-1" }),
          /* @__PURE__ */ jsx("span", { className: "font-display font-semibold tracking-tight text-ink", children: "Agenda Religiosa" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "hidden text-sm text-muted-foreground sm:inline", children: user?.email }),
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: async () => {
                await signOut();
                navigate({ to: "/login" });
              },
              children: [
                /* @__PURE__ */ jsx(LogOut, { className: "mr-2 h-4 w-4" }),
                "Sair"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "w-full bg-surface px-4 py-6 sm:px-6", children })
    ] })
  ] });
}
export {
  AppShell as A,
  Collapsible as C,
  Separator as S,
  CollapsibleTrigger as a,
  CollapsibleContent as b,
  adminUpdateAccountName as c,
  generateTestData as d,
  deleteTestData as e,
  countTestData as f,
  getIsAdmin as g,
  useBranding as h,
  listAllAccounts as l,
  updateAccountSubscription as u
};
