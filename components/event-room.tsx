"use client";

import { User } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { createClient } from "@/utils/supabase/client";

type Object = {
  id: string;
  name: string;
  position_x: number;
  position_y: number;
  height: number;
  width: number;
};
interface EventRoomProps {
  user: User;
  eventId: string;
  initialObjects?: Object[];
}

export default function EventRoom({
  user,
  eventId,
  initialObjects = [],
}: EventRoomProps) {
  const supabase = createClient();
  const [connectionStatus, setConnectionStatus] =
    useState<string>("connecting");

  const channelRef = useRef<any>(null);
  const roomRef = useRef<HTMLDivElement>(null);
  const lastBroadcastTime = useRef<number>(0);
  const broadcastQueue = useRef<any>(null);
  const messageCountRef = useRef<number>(0);
  const dragStartPositions = useRef<any>({});
  const THROTTLE_MS = 100; // Limit to 10 messages per second per user

  const [sharedObjects, setSharedObjects] = useState<any>(() => {
    return initialObjects.map((obj) => ({
      id: obj.id,
      x: obj.position_x,
      y: obj.position_y,
      height: obj.height,
      width: obj.width,
      label: obj.name,
      beingDraggedBy: null,
    }));
  });

  useEffect(() => {
    const channel = supabase.channel(eventId);
    channelRef.current = channel;
    channel
      .on("broadcast", { event: "drag-start" }, (payload) => {
        console.log("Drag start received!", payload);
        if (payload.payload.userId !== user.id) {
          setSharedObjects((prev: any) => {
            return prev.map((obj: any) =>
              obj.id === payload.payload.id
                ? { ...obj, beingDraggedBy: payload.payload.userId }
                : obj
            );
          });
        }
      })

      .on("broadcast", { event: "drag-position" }, (payload) => {
        setSharedObjects((prev: any) => {
          return prev.map((obj: any) =>
            obj.id === payload.payload.id
              ? {
                  ...obj,
                  x: payload.payload.x,
                  y: payload.payload.y,
                  beingDraggedBy:
                    payload.payload.userId !== user.id
                      ? payload.payload.userId
                      : null,
                }
              : obj
          );
        });
      })
      .on("broadcast", { event: "drag-end" }, (payload) => {
        setSharedObjects((prev: any) => {
          return prev.map((obj: any) =>
            obj.id === payload.payload.id
              ? { ...obj, beingDraggedBy: null }
              : obj
          );
        });
      })
      .subscribe((status) => {
        setConnectionStatus(status);
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Throttled broadcast function
  const throttledBroadcast = (event: string, payload: any) => {
    const now = Date.now();
    if (now - lastBroadcastTime.current < THROTTLE_MS) {
      // Queue the latest update, overwriting any pending one
      if (broadcastQueue.current) {
        clearTimeout(broadcastQueue.current);
      }
      broadcastQueue.current = setTimeout(
        () => {
          if (channelRef.current) {
            channelRef.current.send({
              type: "broadcast",
              event,
              payload: { ...payload, timestamp: Date.now() },
            });
            messageCountRef.current++;
            lastBroadcastTime.current = Date.now();
          }
          broadcastQueue.current = null;
        },
        THROTTLE_MS - (now - lastBroadcastTime.current)
      );
    } else {
      // Send immediately
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event,
          payload: { ...payload, timestamp: Date.now() },
        });
        messageCountRef.current++;
        lastBroadcastTime.current = now;
      }
    }
  };

  const handleDragStart = (event: any) => {
    const { active } = event;
    const currentObj = sharedObjects.find((obj: any) => obj.id === active.id);
    if (currentObj) {
      dragStartPositions.current[active.id] = {
        x: currentObj.x,
        y: currentObj.y,
      };
    }

    setSharedObjects((prev: any) => {
      return prev.map((obj: any) =>
        obj.id === active.id ? { ...obj, beingDraggedBy: user.id } : obj
      );
    });

    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "drag-start",
        payload: {
          id: active.id,
          userId: user.id,
          timestamp: Date.now(),
        },
      });
    }
  };

  const handleDragMove = (event: any) => {
    const { delta, active } = event;
    if (delta && dragStartPositions.current[active.id]) {
      const startPos = dragStartPositions.current[active.id];
      const newPosition = {
        x: startPos.x + delta.x,
        y: startPos.y + delta.y,
      };

      setSharedObjects((prev: any) => {
        return prev.map((obj: any) =>
          obj.id === active.id
            ? { ...obj, x: newPosition.x, y: newPosition.y }
            : obj
        );
      });

      throttledBroadcast("drag-position", {
        id: active.id,
        x: newPosition.x,
        y: newPosition.y,
        userId: user.id,
      });
    }
  };

  const handleDragEnd = (event: any) => {
    const { delta, active } = event;
    setSharedObjects((prev: any) => {
      return prev.map((obj: any) =>
        obj.id === active.id ? { ...obj, beingDraggedBy: null } : obj
      );
    });

    if (delta && channelRef.current && dragStartPositions.current[active.id]) {
      const startPos = dragStartPositions.current[active.id];
      const newPosition = {
        x: startPos.x + delta.x,
        y: startPos.y + delta.y,
      };

      setSharedObjects((prev: any) => {
        return prev.map((obj: any) =>
          obj.id === active.id
            ? {
                ...obj,
                x: newPosition.x,
                y: newPosition.y,
                beingDraggedBy: null,
              }
            : obj
        );
      });

      channelRef.current
        .send({
          type: "broadcast",
          event: "drag-position",
          payload: {
            id: active.id,
            x: newPosition.x,
            y: newPosition.y,
            userId: user.id,
            timestamp: Date.now(),
          },
        })
        .then(() => {
          sendDragEnd();
        })
        .catch((error: any) => {
          sendDragEnd();
        });

      const sendDragEnd = () => {
        channelRef.current.send({
          type: "broadcast",
          event: "drag-end",
          payload: {
            id: active.id,
            userId: user.id,
            timestamp: Date.now(),
          },
        });
      };

      delete dragStartPositions.current[active.id];
    }
  };

  return (
    <div>
      <div className="mb-4 p-2 bg-gray-100 rounded">
        <div className="flex justify-between items-center">
          <span
            className={`font-semibold ${connectionStatus === "SUBSCRIBED" ? "text-green-600" : "text-yellow-600"}`}
          >
            Connection Status: {connectionStatus}
          </span>
        </div>
        {connectionStatus !== "SUBSCRIBED" && (
          <span className="text-sm text-gray-600 ml-2">
            Waiting for connection...
          </span>
        )}
      </div>

      <div
        ref={roomRef}
        className="relative w-full h-96 border-2 border-dashed border-gray-300 mt-4 bg-gray-50 rounded-lg cursor-crosshair"
      >
        <DndContext
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        >
          {sharedObjects.map((obj: any) => (
            <Draggable
              key={obj.id}
              id={obj.id}
              height={obj.height}
              width={obj.width}
              position={{ x: obj.x, y: obj.y }}
              isBeingDraggedBy={obj.beingDraggedBy}
              currentUserId={user.id}
            >
              {obj.label}
            </Draggable>
          ))}
        </DndContext>
      </div>
    </div>
  );
}

function Draggable(props: any) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: props.id,
    });

  const isBeingDraggedByOther =
    props.isBeingDraggedBy && props.isBeingDraggedBy !== props.currentUserId;
  const isBeingDraggedByMe = props.isBeingDraggedBy === props.currentUserId;

  const style = {
    position: "absolute" as const,
    left: props.position?.x || 0,
    top: props.position?.y || 0,
    height: props.height || "auto",
    width: props.width || "auto",
    zIndex: isBeingDraggedByMe ? 1000 : isBeingDraggedByOther ? 900 : 800,
    // Only apply transform if we're not managing the position ourselves
    transform: isBeingDraggedByMe ? "none" : CSS.Translate.toString(transform),
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        px-4 py-2 rounded cursor-move text-white font-medium
        ${
          isBeingDraggedByOther
            ? "bg-orange-500 border-2 border-orange-700"
            : isBeingDraggedByMe
              ? "bg-green-500 border-2 border-green-700"
              : "bg-blue-500 hover:bg-blue-600"
        }
      `}
      title={
        isBeingDraggedByOther
          ? `Being moved by user ${props.isBeingDraggedBy.slice(0, 8)}...`
          : isBeingDraggedByMe
            ? "You are moving this object"
            : "Click and drag to move"
      }
    >
      {props.children}
      {isBeingDraggedByOther && (
        <div className="absolute -top-6 left-0 text-xs bg-orange-600 text-white px-1 rounded">
          {props.isBeingDraggedBy.slice(0, 8)}...
        </div>
      )}
    </button>
  );
}

export function Droppable(props: any) {
  const { isOver, setNodeRef } = useDroppable({
    id: props.id,
  });
  const style = {
    opacity: isOver ? 1 : 0.5,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {props.children}
    </div>
  );
}
