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
  const web3formsConfig = JSON.stringify({
    accessKey: process.env.WEB3FORMS_ACCESS_KEY || ""
  }).replace(/</g, "\\u003c");

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: getDemoMarkup() }} />
      <script
        id="web3forms-config"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: web3formsConfig }}
      />
      <DemoInitializer />
    </>
  );
}
