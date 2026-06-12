import { useState } from "react";
import { FaImage } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";
import { API_URL } from "../config";
export default function ImageResizer() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [resizeMethod, setResizeMethod] = useState("dimensions");

  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  const [targetSize, setTargetSize] = useState("");
  const [sizeUnit, setSizeUnit] = useState("KB");

  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleResize = async () => {
    if (!selectedFile) {
      toast.error("Please select an image");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("file", selectedFile);
      formData.append("resize_method", resizeMethod);

      if (resizeMethod === "dimensions") {
        formData.append("width", width);
        formData.append("height", height);
      } else {
        formData.append("target_size", targetSize);
        formData.append("unit", sizeUnit);
      }

      const response = await fetch(
        `${API_URL}/image-resizer`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Resize failed");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;

      const name = selectedFile.name.split(".")[0];

      a.download = `${name}_resized.jpg`;

      document.body.appendChild(a);

      a.click();

      a.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Image resized successfully");
    } catch (error) {
      console.error(error);
      toast.error("Resize failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-950 text-white px-4 py-12">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-4xl font-bold text-center mb-4">
          Image Resizer
        </h1>

        <p className="text-center text-gray-400 mb-10">
          Resize images by dimensions or target file size.
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
                className="max-h-72 rounded-2xl object-contain"
              />
            ) : (
              <div className="text-center">

                <FaImage className="text-6xl mx-auto mb-4 text-purple-400" />

                <h2 className="text-2xl font-bold mb-2">
                  Upload Image
                </h2>

                <p className="text-gray-400">
                  Click here to select image
                </p>

              </div>
            )}

          </label>

          <div className="mt-8">

            <h3 className="font-bold text-xl mb-4">
              Resize Method
            </h3>

            <div className="flex gap-8 mb-6">

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="dimensions"
                  checked={resizeMethod === "dimensions"}
                  onChange={(e) =>
                    setResizeMethod(e.target.value)
                  }
                />
                Width & Height
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="size"
                  checked={resizeMethod === "size"}
                  onChange={(e) =>
                    setResizeMethod(e.target.value)
                  }
                />
                File Size
              </label>

            </div>

            {resizeMethod === "dimensions" ? (
              <div className="grid md:grid-cols-2 gap-4">

                <input
                  type="number"
                  placeholder="Width (px)"
                  value={width}
                  onChange={(e) =>
                    setWidth(e.target.value)
                  }
                  className="bg-black/20 border border-white/10 p-4 rounded-xl"
                />

                <input
                  type="number"
                  placeholder="Height (px)"
                  value={height}
                  onChange={(e) =>
                    setHeight(e.target.value)
                  }
                  className="bg-black/20 border border-white/10 p-4 rounded-xl"
                />

              </div>
            ) : (
              <div className="flex gap-4">

                <input
                  type="number"
                  placeholder="Target Size"
                  value={targetSize}
                  onChange={(e) =>
                    setTargetSize(e.target.value)
                  }
                  className="flex-1 bg-black/20 border border-white/10 p-4 rounded-xl"
                />

                <select
                  value={sizeUnit}
                  onChange={(e) =>
                    setSizeUnit(e.target.value)
                  }
                  className="bg-black/20 border border-white/10 p-4 rounded-xl"
                >
                  <option value="KB">KB</option>
                  <option value="MB">MB</option>
                </select>

              </div>
            )}

          </div>

          <button
            onClick={handleResize}
            disabled={loading}
            className="w-full mt-8 bg-gradient-to-r from-purple-500 to-pink-500 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition"
          >

            {loading ? (
              <ClipLoader
                color="#fff"
                size={24}
              />
            ) : (
              "Resize Image"
            )}

          </button>

        </div>

      </div>
    </div>
  );
}