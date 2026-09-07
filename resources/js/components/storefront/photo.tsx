/**
 * A responsive photograph.
 *
 * Every image in `public/media` is built at 400, 700 and 960 pixels wide in
 * both WebP and JPEG. This picks the narrowest file that covers the space the
 * image actually occupies, rather than handing a 280 pixel card a 960 pixel
 * file, and prefers WebP, which runs roughly half the weight of the JPEG.
 */
const WIDTHS = [400, 700, 960];

function stem(src: string) {
    return src.replace(/\.(jpe?g|png|webp)$/i, '');
}

export function Photo({
    src,
    alt,
    className = '',
    /**
     * How wide the image renders, in CSS terms. Getting this wrong is the
     * usual reason a responsive image still downloads too much.
     */
    sizes = '100vw',
    widths = WIDTHS,
    priority = false,
}: {
    src: string;
    alt: string;
    className?: string;
    sizes?: string;
    widths?: number[];
    priority?: boolean;
}) {
    const base = stem(src);
    const set = (extension: string) =>
        widths
            .map((width) => `${base}-${width}.${extension} ${width}w`)
            .join(', ');

    return (
        <picture>
            <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
            <img
                src={`${base}-${widths[widths.length - 1]}.jpg`}
                srcSet={set('jpg')}
                sizes={sizes}
                alt={alt}
                className={className}
                loading={priority ? 'eager' : 'lazy'}
                decoding={priority ? 'sync' : 'async'}
                fetchPriority={priority ? 'high' : 'auto'}
            />
        </picture>
    );
}
