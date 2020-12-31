type ClassName = string|undefined|false;

export function classNames(
    ...classNames: (ClassName|ClassName[])[]
) {
    return classNames
        .map(className =>
            (new Array<ClassName>())
                .concat(className)
                .filter(name => name)
                .map(name => (name as string).trim())
        )
        .reduce((acc, names) => acc.concat(names), [])
        .join(' ');
}