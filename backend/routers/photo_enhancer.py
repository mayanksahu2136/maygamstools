from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import FileResponse
from PIL import Image
import tempfile
import shutil
import os

router = APIRouter()

@router.post("/photo-enhancer")
async def photo_enhancer(
    file: UploadFile = File(...),
    face_restore: bool = Form(True),
    upscale_factor: int = Form(2)
):
    try:
        temp_dir = tempfile.mkdtemp()

        input_path = os.path.join(
            temp_dir,
            file.filename
        )

        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(
                file.file,
                buffer
            )

        image = Image.open(input_path)

        output_path = os.path.join(
            temp_dir,
            "enhanced.png"
        )

        # Temporary placeholder enhancement
        # Replace later with Real-ESRGAN

        image = image.convert("RGB")

        width, height = image.size

        image = image.resize(
            (
                width * upscale_factor,
                height * upscale_factor
            ),
            Image.LANCZOS
        )

        image.save(output_path)

        return FileResponse(
            output_path,
            media_type="image/png",
            filename="enhanced.png"
        )

    except Exception as e:
        return {
            "error": str(e)
        }