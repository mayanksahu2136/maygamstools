import { useState } from "react";
import { FaImage } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";
import { API_URL } from "../config";

export default function BackgroundRemover() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [processedImage, setProcessedImage] =
    useState(null);

  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));

    setProcessedImage(null);
  };

  const handleRemoveBg = async () => {
    if (!selectedFile) {
      toast.error("Please select an image");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append(
        "file",
        selectedFile
      );

      const response = await fetch(
        `${API_URL}/remove-background`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(
          "Background removal failed"
        );
      }

      const blob =
        await response.blob();

      const imageUrl =
        URL.createObjectURL(blob);

      setProcessedImage(imageUrl);

      toast.success(
        "Background removed successfully"
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Background removal failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;

    const originalName =
      selectedFile.name.split(".")[0];

    const extension =
      selectedFile.name
        .split(".")
        .pop();

    const a =
      document.createElement("a");

    a.href = processedImage;

    a.download = `${originalName}_bg_removed.png`;

    document.body.appendChild(a);

    a.click();

    a.remove();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-950 text-white px-4 py-12">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold text-center mb-4">
          Background Remover
        </h1>

        <p className="text-center text-gray-400 mb-10">
          Remove image backgrounds instantly while
          preserving resolution and quality.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

          <label
            htmlFor="imageUpload"
            className="border-2 border-dashed border-white/20 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition"
          >

            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="max-h-80 rounded-2xl object-contain"
              />
            ) : (
              <div className="text-center">

                <FaImage className="text-6xl mx-auto mb-4 text-purple-400" />

                <h2 className="text-2xl font-bold mb-2">
                  Upload Image
                </h2>

                <p className="text-gray-400">
                  JPG, PNG, WEBP Supported
                </p>

              </div>
            )}

          </label>

          <button
            onClick={handleRemoveBg}
            disabled={loading}
            className="w-full mt-8 bg-gradient-to-r from-purple-500 to-pink-500 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition"
          >

            {loading ? (
              <ClipLoader
                color="#fff"
                size={24}
              />
            ) : (
              "Remove Background"
            )}

          </button>

          {processedImage && (
            <>

              <div className="grid md:grid-cols-2 gap-6 mt-8">

                <div>

                  <h3 className="font-bold text-lg mb-3">
                    Original Image
                  </h3>

                  <img
                    src={preview}
                    alt="original"
                    className="rounded-2xl border border-white/10"
                  />

                </div>

                <div>

                  <h3 className="font-bold text-lg mb-3">
                    Background Removed
                  </h3>

                  <div className="bg-white rounded-2xl p-2">

                    <img
                      src={processedImage}
                      alt="processed"
                      className="rounded-2xl"
                    />

                  </div>

                </div>

              </div>

              <button
                onClick={handleDownload}
                className="w-full mt-6 bg-green-600 hover:bg-green-700 py-4 rounded-2xl font-bold text-lg transition"
              >
                Download Image
              </button>

            </>
          )}

        </div>

      </div>

    </div>
  );
}