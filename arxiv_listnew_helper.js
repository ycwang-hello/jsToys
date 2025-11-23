// ==UserScript==
// @name         ArXiv Helper
// @namespace    https://arxiv.org/
// @version      0.1.1
// @description  Enhances browsing the arXiv new submissions
// @match        https://arxiv.org/list/*/new
// ==/UserScript==

(function() {
    "use strict";

    // Collect all dt entries
    const dts = [...document.querySelectorAll("dt")];

    // Extract abstract links inside each dt
    const abstractLinks = dts.map(dt =>
        dt.querySelector("a[href^='/abs/']")
    ).filter(x => x);

    // Currently selected index. -1 = nothing selected yet.
    let currentIndex = -1;

    // Highlight a dt element briefly (e.g., 2 seconds)
    function highlightDT(idx, duration = 2000) {
        if (idx < 0 || idx >= dts.length) return;
        const el = dts[idx];
        const oldBg = el.style.backgroundColor;
        el.style.backgroundColor = "#ffff99"; // light yellow
        setTimeout(() => { el.style.backgroundColor = oldBg; }, duration);
    }

    // Jump to a dt entry
    function jumpToEntry(idx) {
        if (idx < 0 || idx >= dts.length) return;
        currentIndex = idx;

        const dt = dts[idx];
        const dd = dt.nextElementSibling;

        // Compute the whole item block height
        let blockTop = dt.offsetTop;
        let blockBottom = dd ? (dd.offsetTop + dd.offsetHeight) : (dt.offsetTop + dt.offsetHeight);
        let blockHeight = blockBottom - blockTop;

        const viewportH = window.innerHeight;

        if (blockHeight < viewportH) {
            // Case 1: Item is smaller than viewport → center it
            const targetScrollTop = blockTop - (viewportH - blockHeight) / 2;
            window.scrollTo({ top: targetScrollTop, behavior: "auto" });
        } else {
            // Case 2: Item is taller than viewport → put dt at the top
            dt.scrollIntoView({ behavior: "auto", block: "start" });
        }

        highlightDT(idx);
    }

    // Find the first dt visible on screen (top of viewport)
    function getFirstVisibleDT() {
        const viewportTop = 0; // relative to viewport
        const viewportBottom = window.innerHeight;

        for (let i = 0; i < dts.length; i++) {
            const rect = dts[i].getBoundingClientRect();
            // If any part enters screen
            if (rect.bottom >= viewportTop && rect.top <= viewportBottom) {
                return i;
            }
        }
        return null;
    }

    function escapeHTML(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
        // Move right →
        if (["ArrowRight"].includes(e.key)) {
            e.preventDefault();
            if (currentIndex === -1) {
                // First move → goes to first paper
                jumpToEntry(0);
            } else if (currentIndex < dts.length - 1) {
                jumpToEntry(currentIndex + 1);
            }
        }

        // Move left ←
        else if (["ArrowLeft",].includes(e.key)) {
            e.preventDefault();
            if (currentIndex > 0) {
                jumpToEntry(currentIndex - 1);
            }
        }

        // Press "g": jump to specific number
        else if (e.key === "g") {
            e.preventDefault();
            const input = prompt(`Jump to item number (1 - ${dts.length}):`);
            if (!input) return;

            const n = parseInt(input, 10);
            if (!isNaN(n) && n >= 1 && n <= dts.length) {
                jumpToEntry(n - 1); // user uses 1-based index
            }
        }

        // Press "s": set current item to first visible dt, highlight
        else if (e.key === "s") {
            e.preventDefault();
            const idx = getFirstVisibleDT();
            if (idx !== null) {
                currentIndex = idx;
                highlightDT(idx);
                // Do NOT scroll; just update state
                console.log(`Current item set to ${idx + 1}`);
            }
        }
        // Press "c": click the copy button of the first visible dt
        else if (e.key === "c"
                 && !event.ctrlKey
                 && !event.altKey
                 && !event.metaKey
                 && !event.shiftKey) {
            e.preventDefault();
            const idx = getFirstVisibleDT();
            if (idx !== null) {
                const btn = dts[idx].querySelector("button");
                if (btn) btn.click(); // trigger the existing button behavior
            }
        }

    });

    // Add copy button next to each abstract link
    dts.forEach((dt) => {
        const absLink = dt.querySelector("a[href^='/abs/']");
        if (!absLink) return;

        const arxivid = absLink.textContent.trim();
        const absURL = absLink.href;

        // Title inside next <dd> under .list-title
        const dd = dt.nextElementSibling;
        let title = "";
        if (dd) {
            const t = dd.querySelector(".list-title");
            if (t) title = t.textContent.replace("Title:", "").trim();
        }

        // const md = `[[${arxivid}] ${title}](${absURL})`;
        const html = `<a href="${absURL}">[${arxivid}] ${escapeHTML(title)}</a>`;

        const btn_text = "Copy link" // "Copy MD";

        // Create button
        const btn = document.createElement("button");
        btn.textContent = btn_text;
        btn.style.marginLeft = "6px";
        btn.style.fontSize = "10px";
        btn.style.padding = "1px 4px";

        btn.addEventListener("click", async (ev) => {
            ev.preventDefault();
            try {
                // Create multi-format clipboard item
                await navigator.clipboard.write([
                    new ClipboardItem({
                        "text/plain": new Blob([absURL], { type: "text/plain" }),
                        "text/html": new Blob([html], { type: "text/html" }),
                        // "text/markdown": new Blob([md], { type: "text/markdown" }) // optional for editors that detect markdown MIME
                    })
                ]);
                btn.textContent = "Copied!";
                setTimeout(() => (btn.textContent = btn_text), 2000);
            } catch(err) {
                console.error("Clipboard write failed:", err);
                window.alert("Copy failed!");
            }
        });

        absLink.insertAdjacentElement("afterend", btn);
    });

})();
