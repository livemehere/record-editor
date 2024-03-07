import { DevTools } from "jotai-devtools";
import { Route, Routes } from "react-router";
import { HashRouter } from "react-router-dom";
import Layout from "@renderer/Layout";
import router from "@renderer/router";
import { useDarkMode } from "@renderer/store/darkModeAtom";
import { GlobalLoadingSpinner } from "@renderer/components/GlobalLoadingSpinner";
import { Toaster } from "react-hot-toast";

const App = () => {
  useDarkMode();
  return (
    <>
      <DevTools />
      <GlobalLoadingSpinner />
      <Toaster
        position={"top-left"}
        containerStyle={{ marginTop: "24px", marginLeft: "6px" }}
      />
      <HashRouter>
        <Layout>
          <Routes>
            {router.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                element={<route.element />}
              />
            ))}
          </Routes>
        </Layout>
      </HashRouter>
    </>
  );
};

export default App;
