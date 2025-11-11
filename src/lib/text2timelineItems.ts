const RE_FIRST_WORD_CAPS = /^[A-Z0-9 _'-]+\b/;

export function text2timelineItems(
    text: string,
    timelineItemTypesForTyping: string[]
) {
    const lines = text.split(/\r?\n/);
    const items: any[] = [];

    let currentItem: any = null;

    const commit = () => {
        if (currentItem) {
            items.push(currentItem);
        }
        currentItem = null;
    };

    // known headers that should have lowercase type

    for (let line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const isAllCaps = RE_FIRST_WORD_CAPS.test(trimmed);
        if (isAllCaps) {
            commit();

            const firstWord = trimmed.split(/\s+/)[0].toUpperCase();
            const rest = trimmed.slice(firstWord.length).trim();

            currentItem = {
                id: crypto.randomUUID(),
                type: timelineItemTypesForTyping.includes(firstWord as Uppercase<string>)
                    ? firstWord.toLowerCase()
                    : firstWord,
                title: rest || "",
                details: { text: "" }
            };
        }

        else if (currentItem) {
            currentItem.details.text += (currentItem.details.text ? "\n" : "") + line;
        }

        else {
            console.warn('Ignoreing:', currentItem)
        }
    }

    commit();
    return items;
}
