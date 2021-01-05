export function getRecommendedCollageSize(sizes: generatedJson.CollageSizeDef[]): string {
    return sizes[1].name;
}