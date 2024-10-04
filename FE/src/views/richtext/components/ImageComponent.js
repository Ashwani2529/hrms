import * as React from 'react';
import { Suspense, useRef } from 'react';

const imageCache = new Set();

function useSuspenseImage(src) {
    if (!imageCache.has(src)) {
        throw new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                imageCache.add(src);
                resolve(null);
            };
        });
    }
}

function LazyImage({ altText, className, imageRef, src, width, height, maxWidth }) {
    useSuspenseImage(src);
    return (
        <img
            className={className || undefined}
            src={src}
            alt={altText}
            ref={imageRef}
            style={{
                height,
                maxWidth,
                width
            }}
        />
    );
}

export default function ImageComponent({ src, altText, width, height, maxWidth }) {
    // eslint-disable-next-line no-bitwise
    const imageRef = useRef();

    return (
        <Suspense fallback={null}>
            <>
                <div>
                    <LazyImage
                        className=""
                        src={src}
                        altText={altText}
                        imageRef={imageRef}
                        width={width}
                        height={height}
                        maxWidth={maxWidth}
                    />
                </div>
            </>
        </Suspense>
    );
}
