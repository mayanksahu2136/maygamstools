import { useState } from "react";
import { FaImage } from "react-icons/fa";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";
import { API_URL } from "../config";

export default function PhotoEnhancer() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [faceRestore, setFaceRestore] = useState(true);
  const [upscaleFactor, setUpscaleFactor] = useState("2");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setProcessedImage(null);
  };

  const handleEnhance = async () => {
    if (!selectedFile) {
      toast.error("Please select an image");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("file", selectedFile);
      formData.append("face_restore", faceRestore);
      formData.append("upscale_factor", upscaleFactor);

      const response = await fetch(
        `${API_URL}/photo-enhancer`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Photo enhancement failed");
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      setProcessedImage(imageUrl);

      toast.success(
        "Photo enhanced successfully!"
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Photo enhancement failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;

    const originalName =
      selectedFile?.name?.split(".")[0] ||
      "enhanced_image";

    const a =
      document.createElement("a");

    a.href = processedImage;
    a.download = `${originalName}_enhanced.png`;

    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-950 text-white px-4 py-12">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-bold text-center mb-4">
          AI Photo Enhancer
        </h1>

        <p className="text-center text-gray-400 mb-10">
          Enhance blurry, low-quality, and old photos.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

          {/* Upload Section */}
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
                alt="Preview"
                className="max-h-80 rounded-2xl object-contain"
              />
            ) : (
              <div className="text-center">
                <FaImage className="text-6xl mx-auto mb-4 text-purple-400" />

                <h2 className="text-2xl font-bold mb-2">
                  Upload Photo
                </h2>

                <p className="text-gray-400">
                  JPG, PNG, WEBP Supported
                </p>
              </div>
            )}
          </label>

          {/* Settings */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">

            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">

              <h3 className="font-bold text-lg mb-4">
                Enhancement Settings
              </h3>

              <label className="flex items-center justify-between mb-5">

                <span>
                  Face Restoration (GFPGAN)
                </span>

                <input
                  type="checkbox"
                  checked={faceRestore}
                  onChange={() =>
                    setFaceRestore(
                      !faceRestore
                    )
                  }
                  className="w-5 h-5"
                />

              </label>

              <div>
                <label className="block mb-3">
                  Upscale Factor
                </label>

                <select
                  value={upscaleFactor}
                  onChange={(e) =>
                    setUpscaleFactor(
                      e.target.value
                    )
                  }
                  className="w-full bg-black/30 border border-white/10 rounded-xl p-3"
                >
                  <option value="2">
                    2x Upscale
                  </option>

                  <option value="4">
                    4x Upscale
                  </option>
                </select>
              </div>

            </div>

            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-5 rounded-2xl border border-white/10">

              <div className="flex items-center gap-3 mb-3">
                <FaWandMagicSparkles />
                <h3 className="font-bold text-lg">
                  AI Processing
                </h3>
              </div>

              <ul className="space-y-2 text-gray-300">

                <li>
                  ✓ GFPGAN Face Restoration
                </li>

                <li>
                  ✓ Real-ESRGAN Upscaling
                </li>

                <li>
                  ✓ Noise Reduction
                </li>

                <li>
                  ✓ Sharpness Enhancement
                </li>

                <li>
                  ✓ Detail Recovery
                </li>

              </ul>

            </div>

          </div>

          {/* Enhance Button */}
          <button
            onClick={handleEnhance}
            disabled={loading}
            className="w-full mt-8 bg-gradient-to-r from-purple-500 to-pink-500 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? (
              <ClipLoader
                color="#ffffff"
                size={24}
              />
            ) : (
              "Enhance Photo"
            )}
          </button>

          {/* Results */}
          {processedImage && (
            <>
              <div className="grid md:grid-cols-2 gap-6 mt-8">

                <div>
                  <h3 className="font-bold text-lg mb-3">
                    Original Photo
                  </h3>

                  <img
                    src={preview}
                    alt="Original"
                    className="rounded-2xl border border-white/10"
                  />
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-3">
                    Enhanced Photo
                  </h3>

                  <img
                    src={processedImage}
                    alt="Enhanced"
                    className="rounded-2xl border border-purple-500"
                  />
                </div>

              </div>

              <button
                onClick={handleDownload}
                className="w-full mt-6 bg-green-600 hover:bg-green-700 py-4 rounded-2xl font-bold text-lg transition"
              >
                Download Enhanced Photo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}