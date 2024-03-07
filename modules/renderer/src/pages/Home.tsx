import { useEffect, useState } from "react";
import { css } from "@emotion/react";
import { Stream, StreamStatus } from "@renderer/lib/Stream/Stream";
import useScreenSources from "@renderer/hooks/useScreenSources";
import styled from "@emotion/styled";
import { Source } from "@renderer/components/Home/Source";
import Button from "@renderer/components/ui/Button";
import { useStreamControls } from "@renderer/lib/Stream/useStreamControls";
import Lottie from "lottie-react";
import EmptyLottie from "../../public/lotties/empty.json";
import { LeftAside } from "@renderer/components/styleOnly/LeftAside";
import { CaptureSource } from "../../../main/MainWindow";
import { useNavigate } from "react-router";
import { useStreamAtom } from "@renderer/store/streamAtom";
import { useGlobalAtom } from "@renderer/store";
import { motion } from "framer-motion";
import { fadeUp } from "@renderer/framer";
import { VideoCacheData } from "modules/main/videoCache";
import toast from "react-hot-toast";
import { TbRefresh } from "react-icons/tb";
import { isNexonGame } from "@renderer/utils/nexon";
import { debug } from "@renderer/utils/log";

const Home = () => {
  const { setLoading } = useGlobalAtom();
  const navigate = useNavigate();
  const {
    setLatest,
    setLatestScreenSourceId,
    state: { latestScreenSourceId },
  } = useStreamAtom();
  const { sources, refetch } = useScreenSources();
  const [selectedCaptureSource, setSelectedCaptureSource] =
    useState<CaptureSource>();
  const [status, setStatus] = useState<StreamStatus>("none");
  const streamControls = useStreamControls();
  const [autoRecord, setAutoRecord] = useState(false);

  useEffect(() => {
    const checkShouldShowLoadingSpinner = () => {
      if (sources === undefined) {
        setLoading(true, "미디어 소스 불러오는 중...");
        return;
      }

      if (status === "recording" && autoRecord) {
        setLoading(
          true,
          `<span>${selectedCaptureSource?.name}</span> 게임 녹화 중입니다...`,
        );
        return;
      }

      setLoading(false);
    };
    checkShouldShowLoadingSpinner();
  }, [sources, status, autoRecord, selectedCaptureSource]);

  /** 단축키 녹화(시작,중단) */
  useEffect(() => {
    // 자동감지 중에는 단축키 녹화를 사용하지 않음.
    if (autoRecord) return;
    // @ts-ignore
    const id = window.app.on("short-cut:start-recording", () => {
      if (status === "recording") {
        stopRecording();
      } else {
        if (selectedCaptureSource) {
          startRecording(selectedCaptureSource);
        } else {
          toast.error("녹화를 시작할 수 없습니다. 소스를 선택해주세요");
        }
      }
    });

    return () => {
      // @ts-ignore
      window.app.off(id);
    };
  }, [autoRecord, selectedCaptureSource, status]);

  /** 마지막으로 사용한 소스 자동 선택 */
  useEffect(() => {
    if (sources) {
      sources.some((source) => {
        if (source.id === latestScreenSourceId) {
          setSelectedCaptureSource(source);
          streamControls.current?.connectStream(source);
          return true;
        }
        return false;
      });
    }
  }, [latestScreenSourceId, sources]);

  /** 넥슨 게임 자동 녹화 훅 */
  useEffect(() => {
    let timer: number | undefined = undefined;
    const startChecker = async () => {
      // 스크린 리소스 조회
      const list: CaptureSource[] =
        // @ts-ignore
        await window.app.invoke<CaptureSource[]>("desktopSources");

      const nexonGameSource = list.find((src) => isNexonGame(src.name));
      const isRecordingNow = streamControls.current?.isRecording();

      // 넥슨 게임이 없는데, 녹화 중이라면 (= 게임을 끝 상황) 녹화 종료.
      if (!nexonGameSource && isRecordingNow) {
        // FIXME: 바로 종료하지 말고, 유예기간 테스트 해보기(순간적으로 꺼졌다가 다시켜지는 경우가 있음, 이때는 pause, resume 활용해 볼 것)
        stopRecording();
        return;
      }

      // 넥슨 게임이 있는데, 녹화 중이 아니라면 녹화 시작.
      if (nexonGameSource && !isRecordingNow) {
        handleSelectSource(nexonGameSource);
        startRecording(nexonGameSource);
      }
    };

    const cleanup = () => {
      debug("자동감지 종료");
      clearInterval(timer);
      streamControls.current?.stop();
    };

    if (autoRecord) {
      debug("1초 간격으로 넥슨 게임을 자동감지를 시작합니다.");
      // 자동감지 시작
      timer = window.setInterval(startChecker, 1000);
    } else {
      cleanup();
    }

    return () => {
      cleanup();
    };
  }, [autoRecord]);

  const handleClickAutoRecord = () => {
    setAutoRecord((prev) => {
      if (!prev == true) {
        toast.loading(`넥슨 게임을 자동으로 녹화합니다.`, {
          duration: 2000,
        });
        streamControls.current?.disconnectStream();
        setSelectedCaptureSource(undefined);
      } else {
        toast.success(`넥슨 게임을 자동으로 녹화 중지합니다.`);
      }
      return !prev;
    });
  };

  const handleSelectSource = (source: CaptureSource) => {
    setSelectedCaptureSource(source);
    setLatestScreenSourceId(source.id);

    const controls = streamControls.current;
    if (!controls) return;
    if (controls.getCurrentSource()?.id === source.id) return;
    controls.connectStream(source).catch((e) => {
      debug(e);
      toast.error("소스를 연결할 수 없습니다. 다시 시도해주세요");
    });
  };

  /** 해당 source 로 녹화를 시작 */
  const startRecording = (source: CaptureSource) => {
    const controls = streamControls.current;
    if (!controls) return;

    controls.start(source, { size: source.display?.size }).catch((e) => {
      debug(e);
      toast.error("녹화를 시작할 수 없습니다. 다시 시도해주세요");
    });
  };

  /** 녹화를 중단함. */
  const stopRecording = () => {
    streamControls.current?.stop();
  };

  /** 녹화가 끝나면 edit 페이지로 자동이동 (단, 자동 녹화중일 경우 토스트만 처리) */
  const onSuccess = (cacheData: VideoCacheData) => {
    setLatest(cacheData.filePath);
    if (autoRecord) {
      toast.success("저장되었습니다. 넥슨 게임을 계속 감지합니다.");
    } else {
      navigate("/edit");
      toast.success("저장되었습니다. 편집 페이지로 이동합니다.");
    }
  };

  return (
    <div
      css={css`
        display: flex;
      `}
    >
      <LeftAside>
        {(status === "recording" || autoRecord) && (
          <div className="dimmed"></div>
        )}
        <h3>
          화면 목록
          <button
            onClick={async () => {
              setLoading(true);
              await refetch();
              setLoading(false);
            }}
            css={css`
              padding: 0 12px;
              transform: translateY(3px);
              svg {
                transition: all 300ms;
              }
              :hover {
                svg {
                  transform: rotate(45deg);
                }
              }
            `}
          >
            <TbRefresh size={20} />
          </button>
        </h3>
        <div
          css={css`
            flex: 1;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 20px;
            padding: 12px;
            position: relative;
          `}
        >
          {sources?.map((source) => (
            <Source
              key={source.id}
              source={source}
              onClick={() => handleSelectSource(source)}
              isSelected={selectedCaptureSource?.id === source.id}
            />
          ))}
        </div>
      </LeftAside>
      <RecordControl>
        <div className="preview">
          <Stream
            control={streamControls}
            onChangeStatus={(status) => {
              setStatus(status);
            }}
            onSuccess={onSuccess}
          />
          {!selectedCaptureSource && (
            <NoScreenSource>
              <Lottie
                animationData={EmptyLottie}
                autoplay={true}
                loop={true}
                css={css`
                  width: 100px;
                  height: 100px;
                `}
              />
              <motion.p
                variants={fadeUp}
                initial={"hidden"}
                animate={"show"}
                css={css`
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                `}
              >
                {autoRecord
                  ? "넥슨 게임을 찾고있습니다..."
                  : "미디어 소스를 선택해주세요"}
              </motion.p>
            </NoScreenSource>
          )}
        </div>
        <div className="controller">
          <Button
            onClick={() =>
              status === "recording"
                ? stopRecording()
                : startRecording(selectedCaptureSource!)
            }
            type={status === "recording" ? "danger" : "primary"}
            size={"medium"}
            disabled={autoRecord || !selectedCaptureSource}
          >
            {status === "recording" ? "중단" : "녹화(Ctl+Alt+1)"}
          </Button>
          <Button
            size={"medium"}
            type={"warm"}
            onClick={handleClickAutoRecord}
            disabled={status === "recording"}
          >
            넥슨 게임 자동 녹화 ({autoRecord ? "ON" : "OFF"})
          </Button>
        </div>
      </RecordControl>
    </div>
  );
};

export default Home;

const RecordControl = styled.section`
  padding-left: 20px;
  flex: 1;
  > .preview {
    height: 700px;
    position: relative;
  }

  > .controller {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin: 20px 0;
  }
`;

const NoScreenSource = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 2;
`;
