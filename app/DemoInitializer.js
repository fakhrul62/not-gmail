"use client";

import { useEffect } from "react";

export default function DemoInitializer() {
  useEffect(() => {
    import("../app.js");
  }, []);

  return null;
}
