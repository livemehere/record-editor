import { Layer, Rect, Stage, Transformer } from "react-konva";
import { FC, useEffect, useRef, useState } from "react";
import Konva from "konva";
import { getClientRect, getTotalBox } from "@renderer/utils/konva";

interface Props {
  width: number;
  height: number;
  isCrop: boolean;
  onChangeRectArea?: (rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
}

export const EditCanvasLayer: FC<Props> = ({
  width,
  height,
  isCrop,
  onChangeRectArea,
}) => {
  const stageRef = useRef<Konva.Stage>(null);
  const rectRef = useRef<Konva.Rect>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [isSelected, setIsSelected] = useState(true);

  useEffect(() => {
    const rect = rectRef.current;
    if (isSelected) {
      if (rect) {
        trRef.current?.nodes([rect]);
      } else {
        trRef.current?.nodes([]);
      }
    }
  }, [isCrop, isSelected]);

  return (
    <Stage
      ref={stageRef}
      className={"EditCanvasLayer"}
      width={width}
      height={height}
      onMouseDown={(e) => {
        if (e.target === e.target.getStage()) {
          setIsSelected(false);
        }
      }}
    >
      <Layer>
        {isCrop && (
          <Rect
            ref={rectRef}
            x={width / 4}
            y={height / 4}
            width={width / 2}
            height={height / 2}
            stroke={"red"}
            strokeWidth={1}
            onMouseLeave={() => {
              stageRef.current!.container().style.cursor = "default";
            }}
            onMouseEnter={() => {
              stageRef.current!.container().style.cursor = "grab";
            }}
            onMouseDown={() => {
              stageRef.current!.container().style.cursor = "grabbing";
            }}
            onMouseUp={() => {
              stageRef.current!.container().style.cursor = "grab";
            }}
            onClick={() => {
              setIsSelected(true);
            }}
            onTap={() => {
              setIsSelected(true);
            }}
            draggable
            onTransform={() => {
              rectRef.current?.setAttrs({
                width: Math.max(
                  rectRef.current?.width() * rectRef.current?.scaleX(),
                  5,
                ),
                height: Math.max(
                  rectRef.current?.height() * rectRef.current?.scaleY(),
                  5,
                ),
                scaleX: 1,
                scaleY: 1,
              });
            }}
            onTransformEnd={() => {
              const node = rectRef.current!;
              console.log(node);
              onChangeRectArea?.({
                x: node.x(),
                y: node.y(),
                width: node.width(),
                height: node.height(),
              });
            }}
            onDragEnd={() => {
              const node = rectRef.current!;
              onChangeRectArea?.({
                x: node.x(),
                y: node.y(),
                width: node.width(),
                height: node.height(),
              });
            }}
          />
        )}
        {isSelected && (
          <Transformer ref={trRef} rotateEnabled={false} keepRatio={false} />
        )}
      </Layer>
    </Stage>
  );
};
