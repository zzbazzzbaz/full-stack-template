import { createRouter } from "@tanstack/react-router";

import { routeTree } from "../routeTree.gen";
import { AppErrorComponent } from "./error-component";
import { queryClient } from "./providers";

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultErrorComponent: AppErrorComponent,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
