import { createHashRouter } from "react-router";
import { AppLayout } from "@/components/AppLayout";
import { Overview } from "@/pages/Overview";
import { SignalDetail } from "@/pages/SignalDetail";
import { ChatPage } from "@/pages/ChatPage";

export const router = createHashRouter([
  {
    Component: AppLayout,
    children: [
      { path: "/", Component: Overview },
      { path: "/:country/:signal", Component: SignalDetail },
      { path: "/chat", Component: ChatPage },
    ],
  },
]);
