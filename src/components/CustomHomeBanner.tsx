"use client";

import Link from "next/link";
import { BannerData, BannerElement } from "@/lib/banner";

interface CustomHomeBannerProps {
    banner: BannerData;
}

const FIXED_BANNER_WIDTH = 1200;
const FIXED_BANNER_HEIGHT = 200; // Fixed height matching admin canvas

export default function CustomHomeBanner({ banner }: CustomHomeBannerProps) {
    // If banner is inactive or has no elements, do not take up extra space
    if (!banner.isActive || !banner.elements || banner.elements.length === 0) {
        return null;
    }

    const { backgroundColor = "transparent", elements = [] } = banner;

    // Use transparent background if plain white or not specified
    const bgStyle = backgroundColor && backgroundColor.toLowerCase() !== "#ffffff"
        ? backgroundColor
        : "transparent";

    return (
        <div
            className="w-full relative overflow-hidden rounded-none select-none my-0 transition-all"
            style={{
                backgroundColor: bgStyle,
                height: `${FIXED_BANNER_HEIGHT}px`, // Fixed height matching admin canvas
            }}
        >
            <div className="relative w-full h-full">
                {elements.map((el, index) => {
                    const stackZIndex = 10 + index * 5;
                    const isFullBleed = (el.width || 0) >= FIXED_BANNER_WIDTH && (el.x || 0) <= 0;
                    const leftPercent = (el.x / FIXED_BANNER_WIDTH) * 100;
                    const topPercent = (el.y / FIXED_BANNER_HEIGHT) * 100;
                    const widthPercent = el.width ? (el.width / FIXED_BANNER_WIDTH) * 100 : undefined;
                    const heightPercent = el.height ? (el.height / FIXED_BANNER_HEIGHT) * 100 : undefined;

                    if (el.type === "text") {
                        const textElement = (
                            <div
                                style={{
                                    color: el.color || "#1e293b",
                                    fontWeight: el.fontWeight || "bold",
                                    textAlign: el.textAlign || "left",
                                    fontSize: `clamp(13px, ${(el.fontSize || 22) / 10}vw, ${el.fontSize || 22}px)`,
                                    lineHeight: 1.25,
                                    whiteSpace: "pre-wrap",
                                }}
                            >
                                {el.text}
                            </div>
                        );

                        return (
                            <div
                                key={el.id}
                                className="absolute pointer-events-auto"
                                style={{
                                    left: `${leftPercent}%`,
                                    top: `${topPercent}%`,
                                    width: widthPercent ? `${widthPercent}%` : "max-content",
                                    maxWidth: "100%",
                                    zIndex: stackZIndex,
                                }}
                            >
                                {el.linkUrl ? (
                                    <Link
                                        href={el.linkUrl}
                                        className="hover:opacity-85 transition-opacity inline-block"
                                    >
                                        {textElement}
                                    </Link>
                                ) : (
                                    textElement
                                )}
                            </div>
                        );
                    }

                    if (el.type === "shape") {
                        return (
                            <div
                                key={el.id}
                                className="absolute pointer-events-none"
                                style={{
                                    left: isFullBleed ? "0%" : `${leftPercent}%`,
                                    top: `${topPercent}%`,
                                    width: isFullBleed ? "100%" : `${widthPercent || 10}%`,
                                    height: `${heightPercent || 10}%`,
                                    backgroundColor: el.fillColor || "#3b82f6",
                                    borderColor: el.borderColor || "transparent",
                                    borderWidth: el.borderWidth ? `${el.borderWidth}px` : "0px",
                                    borderStyle: el.borderWidth ? "solid" : "none",
                                    borderRadius:
                                        el.shapeType === "circle"
                                            ? "50%"
                                            : el.shapeType === "rounded-pill"
                                            ? "9999px"
                                            : el.shapeType === "badge"
                                            ? "12px"
                                            : el.shapeType === "line"
                                            ? "1px"
                                            : "8px",
                                    opacity: el.opacity ?? 1,
                                    zIndex: stackZIndex,
                                }}
                            />
                        );
                    }

                    if (el.type === "image" && el.imageUrl) {
                        return (
                            <div
                                key={el.id}
                                className="absolute pointer-events-none overflow-hidden"
                                style={{
                                    left: isFullBleed ? "0%" : `${leftPercent}%`,
                                    top: `${topPercent}%`,
                                    width: isFullBleed ? "100%" : `${widthPercent || 100}%`,
                                    height: `${heightPercent || 100}%`,
                                    borderRadius: el.borderRadius ? `${el.borderRadius}px` : "0px",
                                    zIndex: stackZIndex,
                                }}
                            >
                                <img
                                    src={el.imageUrl}
                                    alt="Banner graphic"
                                    className="w-full h-full pointer-events-none select-none"
                                    style={{
                                        objectFit: el.objectFit || "cover",
                                    }}
                                />
                            </div>
                        );
                    }

                    return null;
                })}
            </div>
        </div>
    );
}
