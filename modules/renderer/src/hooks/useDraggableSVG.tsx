import React, {
  useRef,
  MouseEvent,
  ReactElement,
  FC,
  ReactNode,
  SVGAttributes,
  useEffect,
} from "react";

interface DragRectProps {
  x: number;
  y: number;
  maxX?: number;
  minX?: number;
  maxY?: number;
  minY?: number;
  axis?: "x" | "y" | "xy";
  onMouseDown?: (e: MouseEvent<SVGElement>) => void;
}

const useDraggableSVG = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const activeItem = useRef<ReactElement | null>(null);
  const startCoords = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (
    e: MouseEvent<SVGElement>,
    item: ReactElement<DragRectProps>,
  ) => {
    activeItem.current = item;
    startCoords.current = { x: e.clientX, y: e.clientY };

    if (item.props.onMouseDown) {
      item.props.onMouseDown(e);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (activeItem.current) {
      const { x: startX, y: startY } = startCoords.current;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      const { axis, setX, setY, maxX, maxY, minX, minY } =
        activeItem.current.props;
      if (setX) {
        setX((x: number) => {
          const newX = axis?.includes("x") ? Number(x) + deltaX : Number(x);

          return Math.min(maxX || 999999, Math.max(minX || -999999, newX));
        });
      }
      if (setY) {
        setY((y: number) => {
          const newY = axis?.includes("y") ? Number(y) + deltaY : Number(y);
          return Math.min(maxY, Math.max(minY, newY));
        });
      }

      startCoords.current = { x: e.clientX, y: e.clientY };
    }
  };

  useEffect(() => {
    const handleMouseUp = () => {
      activeItem.current = null;
    };

    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const DraggableSVG: FC<
    { children: ReactNode } & SVGAttributes<SVGSVGElement>
  > = ({ children, ...props }) => {
    const Children = React.Children.toArray(
      children,
    ) as ReactElement<DragRectProps>[];
    const draggableItems = Children.map(
      (item: React.ReactElement<DragRectProps>, index) => {
        if (item.type !== "rect") return item;
        const { x, y } = item.props;
        return React.cloneElement(item, {
          key: index,
          onMouseDown: (e: MouseEvent<SVGElement>) => handleMouseDown(e, item),
          x,
          y,
        });
      },
    );

    return (
      <svg ref={svgRef} onMouseMove={handleMouseMove} {...props}>
        <defs>
          <linearGradient id="Gradient1">
            <stop className="stop1" offset="0%" />
            <stop className="stop2" offset="50%" />
            <stop className="stop3" offset="100%" />
          </linearGradient>
        </defs>
        {draggableItems}
      </svg>
    );
  };

  return DraggableSVG;
};

export default useDraggableSVG;
