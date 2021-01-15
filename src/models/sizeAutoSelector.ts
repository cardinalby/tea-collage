function calcScore(factor, actual, worst, zero, best) {
    const isWorseThanTarget = worst > best
        ? actual > zero
        : actual < zero;
    return factor * (isWorseThanTarget
        ? Math.max((actual - zero) / (zero - worst), -1)
        : Math.min((actual - zero) / (best - zero), 1));
}

function toBytesPerSec(mBitsPerSec: number): number {
    return mBitsPerSec * 1024 * 1024 / 8;
}

function isMobileDevice(): boolean {
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i
        .test(navigator.userAgent));
}

function isUserGoingToZoom(): boolean {
    return isMobileDevice() || Math.max(window.screen.width, window.screen.height) < 700;
}

export function getRecommendedCollageSize(sizes: generatedJson.CollageSizeDef[]): string {
    const sizesScore = new Map<string, number>(sizes.map(size => [size.name, 0]));
    function addScore(name: string, score: number) {
        const currentScore = sizesScore.get(name) || 0;
        sizesScore.set(name, currentScore + score);
    }

    const connection = navigator.connection;
    const downlink = connection && connection.downlink && toBytesPerSec(connection.downlink);
    if (downlink) {
        sizes.forEach(size => {
            const estimatedLoadTimeSec = size.avgImgSize / downlink;
            const bestLoadTimeSec = size.avgImgSize / toBytesPerSec(10); // due to chrome fingerprinting protection
            const speedScore = calcScore(
                5,
                estimatedLoadTimeSec,
                25,
                Math.max(1.5, bestLoadTimeSec) + 0.1,
                bestLoadTimeSec);
            addScore(size.name, speedScore);
        });
    }

    if (connection && connection.saveData === true) {
        sizes.forEach(size => {
            const saveDataScore = calcScore(2, size.avgImgSize * 1024, 50, 30, 15);
            addScore(size.name, saveDataScore);
        });
    }

    const biggestScreenDimensionPx = Math.max(window.screen.width, window.screen.height) * window.devicePixelRatio;
    const bestScreenBigDimension = isUserGoingToZoom() ? biggestScreenDimensionPx * 2 : biggestScreenDimensionPx;
    sizes.forEach(size => {
        const biggestImgDimensionPx = Math.max(size.width, size.height);
        const screenSizeScore = calcScore(
            2,
            biggestImgDimensionPx,
            biggestScreenDimensionPx * 0.3,
            biggestScreenDimensionPx * 0.5,
            bestScreenBigDimension);
        addScore(size.name, screenSizeScore);
    });

    return sizes.reduce(function(prev, current) {
        return ((sizesScore.get(prev.name) || 0) > (sizesScore.get(current.name) || 0)) ? prev : current
    }).name;
}