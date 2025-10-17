"use client";

import React from "react";

interface InfiniteScrollerProps {
  items: React.ReactNode[];
  baseSpeedPerItem?: number;
  disabled?: boolean;
}

export default function InfiniteScroller({
  items,
  baseSpeedPerItem = 5,
  disabled = false,
}: InfiniteScrollerProps) {
  const duration = items.length * baseSpeedPerItem;

  return (
    <div className="relative w-full overflow-hidden group">
      <div
        className={`flex whitespace-nowrap ${!disabled && "[mask-image:_linear-gradient(to_right,_transparent_0,_white_60px,white_calc(100%-60px),_transparent_100%)]"}`}
      >
        <div
          className={` inline-flex  ${!disabled && "animate-infinite-scroll"} `}
          style={{
            animation: !disabled
              ? `infinite-scroll ${duration}s linear infinite`
              : undefined,
          }}
        >
          {items.map((item, index) => (
            <div key={index} className="inline-block px-4">
              {item}
            </div>
          ))}
        </div>

        {!disabled && (
          <>
            <div
              style={{
                animation: !disabled
                  ? `infinite-scroll ${duration}s linear infinite`
                  : undefined,
              }}
              className={` inline-flex  ${!disabled && "animate-infinite-scroll"} `}
            >
              {items.map((item, index) => (
                <div key={`dup-${index}`} className="inline-block px-4">
                  {item}
                </div>
              ))}
            </div>
            {/* <div
              style={{
                animation: !disabled
                  ? `infinite-scroll ${duration}s linear infinite`
                  : undefined,
              }}
              className={` inline-flex `}
            >
              {items.map((item, index) => (
                <div key={`dup-${index}`} className="inline-block px-4">
                  {item}
                </div>
              ))}
            </div> */}
          </>
        )}
      </div>
    </div>
  );
}
