/**
 * Resolve a relative router path against the current location
 * when using a hash router (SolidJS).
 *
 * relative: string like "../item/123"
 * base: current router path like "/script/attach-new/note/abc"
 */
export function resolveRoute(relative: string): string {
    const base = location.hash;
    console.log('resolveRoute - enter with', relative, base);
    const cleanBase = base.replace(/^#/, "");

    const baseParts = cleanBase.split("/").filter(Boolean);
    const relParts = relative.split("/");

    const resultParts = [...baseParts];

    for (const part of relParts) {
        if (part === "" || part === ".") {
            continue;
        }
        if (part === "..") {
            resultParts.pop();
        } else {
            resultParts.push(part);
        }
    }

    console.log('resolveRoute - exit', "/" + resultParts.join("/"));
    return "/" + resultParts.join("/");
}


/**
 * Create a child route under the *first* directory of the current hash route or under /script.
 *
 * @example
 *   Current URL:  `#/script/foo/bar`
 *   `childRoute("item/4")` returns "/script/item/4"
 */
export function childRoute(path: string): string {
    const clean = location.hash.replace(/^#/, "");
    const parts = clean.split("/").filter(Boolean);
    const section = parts[0] ?? "/script";
    const child = path.replace(/^\/+/, "");
    return `/${section}/${child}`;
}

