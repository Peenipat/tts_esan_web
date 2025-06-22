export interface SummaryItem {
    id: string;
    text: string;
}

export function parseSummary(summary: string): SummaryItem[] {
    if (!summary) return [];

    const items = summary.split(/\n(?=\d+:)/g).map((item) => {
        const match = item.match(/^(\d+):\s*(.*)/s);
        if (!match) return null;

        return {
            id: match[1],
            text: match[2].trim(),
        };
    });

    return items.filter(Boolean) as SummaryItem[];
}
