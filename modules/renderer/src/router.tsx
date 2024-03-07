import Home from "@renderer/pages/Home";
import Settings from "@renderer/pages/Settings";
import { Edit } from "@renderer/pages/Edit";
import { BsFillCameraVideoFill } from "react-icons/bs";
import { FaCut } from "react-icons/fa";

const router = [
  {
    path: "/",
    element: Home,
    label: "화면 녹화",
    icon: <BsFillCameraVideoFill />,
  },
  {
    path: "/edit",
    element: Edit,
    label: "편집",
    icon: <FaCut />,
  },
  // {
  //   path: "/settings",
  //   element: Settings,
  //   label: "설정",
  // },
];

export default router;
