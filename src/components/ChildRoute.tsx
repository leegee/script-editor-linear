import { createContext, useContext, createSignal, onCleanup, ParentProps } from "solid-js";

interface ChildRouteContextValue {
    currentSection: () => string;
    childRoute: (path: string) => string;
}

const ChildRouteContext = createContext<ChildRouteContextValue>();

export function ChildRouteProvider(props: ParentProps) {
    const [currentSection, setCurrentSection] = createSignal("list");

    const updateSectionFromHash = () => {
        const clean = window.location.hash.replace(/^#\/?/, "");
        const parts = clean.split("/").filter(Boolean);
        const section = parts[0];
        setCurrentSection(/^(list|typing|timeline)$/.test(section) ? section : "list");
    };

    updateSectionFromHash();
    window.addEventListener("hashchange", updateSectionFromHash);
    onCleanup(() => window.removeEventListener("hashchange", updateSectionFromHash));

    const childRoute = (path: string) => {
        const child = path.replace(/^\/+/, "");
        return `/${currentSection()}/${child}`;
    };

    return (
        <ChildRouteContext.Provider value={{ currentSection, childRoute }}>
            {props.children}
        </ChildRouteContext.Provider>
    );
}

export function useChildRoute() {
    const context = useContext(ChildRouteContext);
    if (!context) throw new Error("useChildRoute must be used within a ChildRouteProvider");
    return context;
}
