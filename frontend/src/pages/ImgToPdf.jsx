import { useState } from "react";
import { FaFilePdf } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";
import { API_URL } from "../config";
export default function ImgToPdf() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
  const files = Array.from(e.target.files);

  setSelectedFiles(files);

  const imagePreviews = files.map((file) =>
    URL.createObjectURL(file)
  );

  setPreviews(imagePreviews);
  };

  const handleConvert = async () => {
  if (!selectedFiles.length) {
    toast.error("Please select images");
    return;
  }

  try {
    setLoading(true);

    const formData = new FormData();

    for (const file of selectedFiles) {
      formData.append("files", file);
    }

    const response = await fetch(
      `${API_URL}/img-to-pdf`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Conversion failed");
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    const originalName =
      selectedFiles[0].name.split(".")[0];

    a.download = `${originalName}.pdf`;

    document.body.appendChild(a);

    a.click();

    a.remove();

    window.URL.revokeObjectURL(url);

    toast.success("PDF downloaded");
  } catch (error) {
    console.error(error);
    toast.error("Conversion failed");
  } finally {
    setLoading(false);
  }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-950 text-white px-4 py-12">

      <div className="max-w-3xl mx-auto">

        <h1 className="text-4xl font-bold text-center mb-4">
          Image to PDF Converter
        </h1>

        <p className="text-center text-gray-400 mb-10">
          Convert JPG, PNG and other images into PDF files instantly.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

          <label
            htmlFor="imageUpload"
            className="border-2 border-dashed border-white/20 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition"
          >

            <input
              type="file"
              multiple
              id="imageUpload"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />

            {selectedFiles.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {previews.map((preview, index) => (
                <img
                  key={index}
                  src={preview}
                  alt={`Preview ${index}`}
                  className="w-full h-32 object-cover rounded-xl"
                />
              ))}
            </div>
            ) : (
              <div className="text-center">

                <FaFilePdf className="text-6xl mx-auto mb-4 text-red-400" />

                <h2 className="text-2xl font-bold mb-2">
                  Upload Image
                </h2>

                <p className="text-gray-400">
                  Click here to select image
                </p>

              </div>
            )}

          </label>

          <button
            onClick={handleConvert}
            disabled={loading}
            className="w-full mt-8 bg-gradient-to-r from-purple-500 to-pink-500 py-4 rounded-2xl font-bold text-lg"
          >

            {loading ? (
              <ClipLoader color="#fff" size={24} />
            ) : (
              "Convert to PDF"
            )}

            


          </button>

        </div>

      </div>

    </div>
  );
}