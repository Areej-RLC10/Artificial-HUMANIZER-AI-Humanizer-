'use client';

import React, { Suspense, lazy } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

export function SplineScene({ scene, className }) {
    return (
        <Suspense
            fallback={
                <div className="w-full h-full flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-gray-200 dark:border-gray-700 border-t-black dark:border-t-white rounded-full animate-spin"></div>
                </div>
            }
        >
            <Spline
                scene={scene}
                className={className}
            />
        </Suspense>
    );
}
