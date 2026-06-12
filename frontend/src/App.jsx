import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import ImgToPdf from "./pages/ImgToPdf";
import PdfToImg from "./pages/PdfToImg";
import ImageResizer from "./pages/ImageResizer";
import BackgroundRemover from "./pages/BackgroundRemover";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route
          path="/tools/image-to-pdf"
          element={<ImgToPdf />}
        />

        <Route
          path="/tools/pdf-to-image"
          element={<PdfToImg />}
        />

        <Route
          path="/tools/image-resizer"
          element={<ImageResizer />}
        />

        <Route
          path="/tools/background-remover"
          element={<BackgroundRemover />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;