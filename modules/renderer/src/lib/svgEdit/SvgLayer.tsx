import { css } from "@emotion/react";
import React, { FC, HTMLAttributes, useEffect, useRef, useState } from "react";
import { distance } from "@renderer/lib/svgEdit/utils";

type LayerElement = {
  id: number;
  className?: string;
  type: "circle" | "rect" | "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  drag?: "x" | "y" | "xy";
};

export const useSvgLayer = () => {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const id = useRef<number>(0);
  const [elements, setElements] = useState<LayerElement[]>([]);
  const [isReady, setIsReady] = useState(false);

  /** Drag */
  const [selected, setSelected] = useState<LayerElement>();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const layerRoot = layerRef.current;
    if (!layerRoot) return;

    const getParentRect = () => {
      return layerRoot.getBoundingClientRect();
    };

    const handlePointerDown = (e: PointerEvent) => {
      const rect = getParentRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const dragAbleElements = elements.filter((el) => el.drag);
      const target = getElementByPosition(x, y, dragAbleElements);
      target && setSelected(target);
      setMouse({ x, y });
    };
    const handlePointerMove = (e: PointerEvent) => {
      if (!selected) return;
      const rect = getParentRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const deltaX = x - mouse.x;
      const deltaY = y - mouse.y;
    };
    const handlePointerUp = () => {
      setMouse({ x: 0, y: 0 });
      setSelected(undefined);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [elements]);

  /** Ready Check Loop */
  useEffect(() => {
    let id: number;
    id = requestAnimationFrame(readyCheckLoop);
    function readyCheckLoop() {
      id = requestAnimationFrame(readyCheckLoop);
      if (layerRef.current) {
        setIsReady(true);
        cancelAnimationFrame(id);
      }
    }
    return () => {
      cancelAnimationFrame(id);
    };
  }, []);

  const getLayerSize = () => {
    const width = layerRef.current?.clientWidth;
    const height = layerRef.current?.clientHeight;
    return {
      width,
      height,
    };
  };

  const createElement = (element: Omit<LayerElement, "id">) => {
    setElements((prev) => [...prev, { ...element, id: id.current++ }]);
  };

  const getElementsByClassName = (className: string) => {
    return elements.filter((el) => el?.className === className);
  };

  const updateElementByClassName = (
    className: string,
    update: (prev: LayerElement) => Partial<LayerElement>,
  ) => {
    setElements((prev) => {
      const copy = prev;
      const targets = copy.filter((el) => el?.className === className);
      targets.forEach((target, index) => {
        copy[index] = {
          ...target,
          ...update(target),
        };
      });
      return copy;
    });
  };

  return {
    isReady,
    elements,
    createElement,
    getElementsByClassName,
    updateElementByClassName,
    getLayerSize,
    layerRef,
  };
};

interface Props {
  elements: LayerElement[];
}

export const SvgLayer = React.forwardRef<HTMLDivElement, Props>(
  ({ elements }, ref) => {
    const drawLayerElement = (el: LayerElement) => {
      const { id, type, x1, y1, x2, y2, stroke, fill, strokeWidth } = el;
      switch (type) {
        case "circle":
          return (
            <circle
              key={id}
              cx={x1}
              cy={y1}
              r={distance(x1, y1, x2, y2)}
              fill={fill || "transparent"}
              stroke={stroke || "red"}
              strokeWidth={strokeWidth ?? (stroke ? 1 : 0)}
            />
          );
        case "rect":
          return (
            <rect
              key={id}
              x={x1}
              y={y1}
              width={x2 - x1}
              height={y2 - y1}
              fill={fill || "transparent"}
              stroke={stroke}
              strokeWidth={strokeWidth ?? (stroke ? 1 : 0)}
            />
          );
        case "line":
          return (
            <line
              key={id}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
          );
        default:
          throw new Error(`Unsupported draw element type ${type}`);
      }
    };

    return (
      <div
        id={"svgLayer"}
        ref={ref}
        css={css`
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        `}
      >
        <svg width={"100%"} height={"100%"}>
          {elements.map((el) => drawLayerElement(el))}
        </svg>
      </div>
    );
  },
);

function getElementByPosition(
  x: number,
  y: number,
  dragAbleElements: LayerElement[],
) {
  const bounds = 5;
  let collideElement: LayerElement | null = null;
  for (let i = 0; i < dragAbleElements.length; i++) {
    const { type, x1, x2, y1, y2 } = dragAbleElements[i];
    switch (type) {
      case "rect":
        if (checkCollisionWith(x, y, x1, y1, x2, y2, bounds)) {
          collideElement = dragAbleElements[i];
        }
        break;
      default:
        throw new Error(
          `[getElementByPosition()] Unsupported drag type ${type}`,
        );
    }
    if (collideElement) {
      break;
    }
  }
  return collideElement;
}

function checkCollisionWith(
  x: number,
  y: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  bounds: number,
): boolean {
  return (
    x >= x1 - bounds && x <= x2 + bounds && y >= y1 - bounds && y <= y2 + bounds
  );
}
