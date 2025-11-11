const RE_FIRST_WORD_CAPS = /^[A-Z0-9 _'-]+\b/;

export function text2timelineItems(
    text: string,
    timelineItemTypesForTyping: string[],
    findCharacterByName: (name: string) => string | undefined,
    findLocationByName: (name: string) => string | undefined,
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

    for (let line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const isAllCaps = RE_FIRST_WORD_CAPS.test(trimmed);
        if (isAllCaps) {
            commit();

            const firstWord = trimmed.split(/\s+/)[0].toUpperCase();
            const rest = trimmed.slice(firstWord.length).trim();

            const type = timelineItemTypesForTyping.includes(firstWord as Uppercase<string>)
                ? firstWord.toLowerCase()
                : 'dialogue';

            if (type === 'dialogue' || type === 'location') {
                const ref = type === 'dialogue'
                    ? findCharacterByName(trimmed)
                    : findLocationByName(rest);

                if (!ref) {
                    throw new Error(`Could not find ${type} referenced by "${trimmed}"`)
                }

                currentItem = {
                    type: type,
                    details: {
                        ref: ref,
                        text: ""
                    }
                };
            }
            else {
                currentItem = {
                    type: type,
                    title: rest || "",
                    details: { text: "" }
                };
            }
        }

        else if (currentItem) {
            currentItem.details.text += (currentItem.details.text ? "\n\n" : "") + line;
        }

        else {
            console.warn('Ignoring:', currentItem)
        }
    }

    commit();
    return items;
}
