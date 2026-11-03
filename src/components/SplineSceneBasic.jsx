'use client';

import React from 'react';
import { SplineScene } from './ui/splite';
import { Spotlight } from './ui/spotlight';
import { motion } from 'framer-motion';
import { FiArrowRight, FiPlay } from 'react-icons/fi';

export function SplineSceneBasic() {
    return (
        <div className="w-full h-[400px] md:h-[500px] bg-black dark:bg-white relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
            <Spotlight
                className="-top-40 left-0 md:left-60 md:-top-20"
                size={300}
            />
            
            <div className="flex h-full flex-col md:flex-row">
                {/* Left content */}
                <div className="flex-1 p-6 md:p-8 relative z-10 flex flex-col justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">
                            AI Humanizer
                        </span>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white dark:text-black">
                            Humanize AI<br />
                            <span className="bg-gradient-to-br from-white to-gray-400 dark:from-black dark:to-gray-600 bg-clip-text text-transparent">
                                Text Naturally
                            </span>
                        </h1>
                        <p className="mt-3 text-sm md:text-base text-gray-300 dark:text-gray-600 max-w-lg leading-relaxed">
                            Transform AI-generated content into natural, human-like writing.
                            Detect AI patterns and humanize your text while preserving your
                            original message.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <button className="px-6 py-2.5 bg-white dark:bg-black text-black dark:text-white font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition text-sm flex items-center gap-2">
                                Get Started
                                <FiArrowRight className="w-4 h-4" />
                            </button>
                            <button className="px-6 py-2.5 border border-gray-700 dark:border-gray-300 text-white dark:text-black font-semibold rounded-xl hover:bg-white/10 dark:hover:bg-black/10 transition text-sm flex items-center gap-2">
                                <FiPlay className="w-4 h-4" />
                                Watch Demo
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Right content - 3D Scene */}
                <div className="flex-1 relative h-[200px] md:h-auto">
                    <SplineScene 
                        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                        className="w-full h-full"
                    />
                </div>
            </div>
        </div>
    );
}
