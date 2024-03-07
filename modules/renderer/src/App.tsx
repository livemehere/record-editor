import { DevTools } from "jotai-devtools";
import { Route, Routes } from "react-router";
import { HashRouter } from "react-router-dom";
import Layout from "@renderer/Layout";
import router from "@renderer/router";
import { useDarkMode } from "@renderer/store/darkModeAtom";
import { GlobalLoadingSpinner } from "@renderer/components/GlobalLoadingSpinner";
import { Toaster } from "react-hot-toast";
import { ModalProvider } from "async-modal-react";

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
        <ModalProvider
          closeOnOutsideClick={true}
          disableBodyScrollWhenOpen={true}
          closeOnRouteChange={true}
        >
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
        </ModalProvider>
      </HashRouter>
    </>
  );
};

export default App;
