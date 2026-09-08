import fs from "node:fs";
import path from "node:path";
import DemoInitializer from "./DemoInitializer";

export const dynamic = "force-static";

function getDemoMarkup() {
  const source = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf8");
  const body = source.match(/<body[^>]*>([\s\S]*?)<script\s+src="app\.js"><\/script>[\s\S]*?<\/body>/i);

  if (!body) {
    throw new Error("Unable to read the Gmail demo markup from index.html");
  }

  return body[1];
}

export default function HomePage() {
  return (
    <>
      <div className="mailbox-root" dangerouslySetInnerHTML={{ __html: getDemoMarkup() }} />
      <DemoInitializer />
    </>
  );
}
