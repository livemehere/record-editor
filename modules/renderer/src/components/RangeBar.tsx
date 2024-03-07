import { FC, ReactNode, SVGAttributes, useEffect, useState } from "react";
import { css } from "@emotion/react";
import { map, normalized } from "@renderer/lib/svgEdit/utils";
import useDraggableSVG from "@renderer/hooks/useDraggableSVG";

interface Props {
  min: number;
  max: number;
  displayValue?: number;
  width?: number;
  height?: number;
  padding?: number;
  onChange?: (min: number, max: number) => void;
}

const RangeBar: FC<Props> = ({
  min,
  max,
  displayValue,
  width = 800,
  height = 40,
  padding = 10,
  onChange,
}) => {
  const innerWidth = width - padding;
  const innerHeight = height - padding;
  const innerZero = padding / 2;
  const innerMax = innerWidth;

  const [_min, set_min] = useState(innerZero);
  const [_max, set_max] = useState(innerWidth);

  const minRatio = normalized(_min, innerZero, innerMax);
  const maxRatio = normalized(_max, innerZero, innerMax);
  const _v = displayValue
    ? map(displayValue, min, max, innerZero, innerMax)
    : undefined;

  const actualMin = minRatio * (max - min) + min;
  const actualMax = maxRatio * (max - min) + min;

  useEffect(() => {
    onChange?.(actualMin, actualMax);
  }, [_min, _max]);

  const DraggableSVG = useDraggableSVG();

  return (
    <div
      css={css`
        svg {
          & * {
            transform-box: fill-box;
          }
        }
      `}
    >
      <DraggableSVG width={width} height={height}>
        {/** background */}
        <rect
          x={padding / 2}
          y={padding / 2}
          width={innerWidth}
          height={innerHeight}
          fill={"var(--darkBackground)"}
          rx={5}
          ry={5}
        />
        <rect
          id="range"
          x={_min}
          y={padding / 2}
          width={_max - _min}
          height={innerHeight}
          fill={"var(--blue800)"}
          rx={5}
          ry={5}
        />
        {_v && (
          <rect
            x={_v}
            y={5}
            width={8}
            height={height - 10}
            fill={"var(--red500)"}
            rx={2}
          />
        )}
        <rect
          x={_min}
          setX={set_min}
          minX={padding / 2}
          dragAble
          axis="x"
          y={5}
          width={8}
          height={height - 10}
          fill={"var(--yellow50)"}
          style={{
            cursor: "col-resize",
          }}
          rx={2}
        />
        <rect
          x={_max}
          setX={set_max}
          maxX={width - padding / 2}
          dragAble
          axis="x"
          y={5}
          width={8}
          height={height - 10}
          fill={"var(--yellow50)"}
          style={{
            cursor: "col-resize",
            transform: "translateX(-4px)",
          }}
          rx={2}
        />
      </DraggableSVG>
    </div>
  );
};

export default RangeBar;
