// import { createSignal, onCleanup } from "solid-js";

// export function resolveRoute(relative: string): string {
//     const base = location.hash;
//     console.log('resolveRoute - enter with', relative, base);
//     const cleanBase = base.replace(/^#/, "");

//     const baseParts = cleanBase.split("/").filter(Boolean);
//     const relParts = relative.split("/");

//     const resultParts = [...baseParts];

//     for (const part of relParts) {
//         if (part === "" || part === ".") {
//             continue;
//         }
//         if (part === "..") {
//             resultParts.pop();
//         } else {
//             resultParts.push(part);
//         }
//     }

//     console.log('resolveRoute - exit', "/" + resultParts.join("/"));
//     return "/" + resultParts.join("/");
// }

// // Solid router is not developed enough to have hooks or guards....

// const [currentSection, setCurrentSection] = createSignal("script");
// const updateSectionFromHash = () => {
//     const clean = window.location.hash.replace(/^#\/?/, "");
//     const parts = clean.split("/").filter(Boolean);
//     const section = parts[0];
//     setCurrentSection(/^(script|typing|timeline)$/.test(section) ? section : "script");
// };
// updateSectionFromHash();

// window.addEventListener("hashchange", updateSectionFromHash);
// onCleanup(() => window.removeEventListener("hashchange", updateSectionFromHash));

// export function childRoute(path: string): string {
//     const child = path.replace(/^\/+/, "");
//     return `#/${currentSection()}/${child}`;
// }
