import { BareMuxConnection } from "@mercuryworkshop/bare-mux";

const iframe = document.getElementById("iframe") as HTMLIFrameElement;
let wisp =
  (location.protocol === "https:" ? "wss" : "ws") +
  "://" +
  location.host +
  "/goo/";
const transport = localStorage.getItem("@lunar/settings/transport");
const connection = new BareMuxConnection("/bm/worker.js");
let bar = document.getElementById("url") as HTMLInputElement;
let previousUrl = "";
let clear = document.getElementById("clear") as HTMLButtonElement;
let favicon = document.getElementById("favicon") as HTMLImageElement;
let title = document.getElementById("name") as HTMLTitleElement;
let copy = document.getElementById("copy") as HTMLButtonElement;

function limit() {
  const vw = Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0,
  );
  const charWidth = 8;
  return Math.floor(vw / charWidth);
}

async function frame() {
  if (transport === "ep") {
    console.debug("Using epoxy transport");
    await connection.setTransport("/ep/index.mjs", [{ wisp: wisp }]);
  } else if (transport === "lc") {
    console.debug("Using libcurl transport");
    await connection.setTransport("/lb/index.mjs", [{ wisp: wisp }]);
  } else {
    console.error("No valid transport found, defaulting to libcurl...");
    await connection.setTransport("/lb/index.mjs", [{ wisp: wisp }]);
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./sw.js", { scope: "/p/" })
      .then(({ scope }) => console.debug("SW registered with scope:", scope))
      .catch((error) =>
        console.error("SW registration failed with error:", error),
      );
  }
  let gourl = localStorage.getItem("@lunar/gourl") || "https://google.com";
  const regex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/;
  const engine =
    localStorage.getItem("@lunar/settings/engine") ||
    "https://www.google.com/search?q=";

  if (regex.test(gourl)) {
    if (!/^https?:\/\//i.test(gourl)) {
      gourl = `https://${gourl}`;
    }
  } else {
    gourl = `${engine}${encodeURIComponent(gourl)}`;
  }

  iframe.src = `/p/${config.encodeUrl(gourl)}`;

  // Nav Bar

  setInterval(() => {
    const url = iframe.contentWindow?.__uv$location?.href;
    if (url && url !== previousUrl) {
      const charLimit = limit();
      bar.value =
        url.length > charLimit ? url.substring(0, charLimit) + "..." : url;
      previousUrl = url;
    }

    const image = `${iframe.contentWindow!.__uv$location?.origin}/favicon.ico`;
    favicon.src = image || "../global.png"

    title.textContent = iframe.contentWindow?.document.title || "";
  }, 1000);
}

bar.onkeydown = (e) => {
  if (e.key === "Enter") {
    let Inputurl = bar.value;
    localStorage.setItem("@lunar/gourl", Inputurl);
    frame();
  }
};

clear.addEventListener("click", () => {
  bar.value = "";
  bar.focus();
});

copy.addEventListener("click", async () => {
  await navigator.clipboard.writeText(
    iframe.contentWindow?.__uv$location?.href || "",
  );
  console.debug("Copied to clipboard");
});
frame();
