from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse

from PIL import Image
import os
import uuid

router = APIRouter()

UPLOAD_DIR = "uploads"
CONVERTED_DIR = "converted"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(CONVERTED_DIR, exist_ok=True)

MAX_FILE_SIZE = 20 * 1024 * 1024

def cleanup_files(*paths):
    for path in paths:
        try:
            if path and os.path.exists(path):
                os.remove(path)
        except Exception:
            pass

@router.post("/image-resizer")
async def image_resizer(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    resize_method: str = Form(...),
    width: int = Form(None),
    height: int = Form(None),
    target_size: float = Form(None),
    unit: str = Form("KB")

):

    extension = os.path.splitext(file.filename)[1].lower()

    if extension not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WEBP files are supported"
        )

    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Maximum file size is 20MB"
        )

    unique_name = str(uuid.uuid4())

    input_path = os.path.join(
        UPLOAD_DIR,
        f"{unique_name}{extension}"
    )

    output_path = os.path.join(
        CONVERTED_DIR,
        f"{unique_name}.jpg"
    )

    try:

        with open(input_path, "wb") as f:
            f.write(content)

        image = Image.open(input_path)

        if image.mode != "RGB":
            image = image.convert("RGB")

        # -----------------------------
        # Resize By Width & Height
        # -----------------------------
        if resize_method == "dimensions":

            if not width or not height:
                raise HTTPException(
                    status_code=400,
                    detail="Width and Height are required"
                )

            image = image.resize(
                (int(width), int(height))
            )

            image.save(
                output_path,
                format="JPEG",
                quality=95,
                optimize=True
            )

        # -----------------------------
        # Resize By Target Size
        # -----------------------------
        elif resize_method == "size":

            if not target_size:
                raise HTTPException(
                    status_code=400,
                    detail="Target size required"
                )

            target_bytes = (
                target_size * 1024
                if unit.upper() == "KB"
                else target_size * 1024 * 1024
            )

            quality = 95

            while quality >= 5:

                image.save(
                    output_path,
                    format="JPEG",
                    quality=quality,
                    optimize=True
                )

                current_size = os.path.getsize(
                    output_path
                )

                if current_size <= target_bytes:
                    break

                quality -= 5

        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid resize method"
            )

        background_tasks.add_task(
            cleanup_files,
            input_path,
            output_path
        )

        original_name = os.path.splitext(
            file.filename
        )[0]

        return FileResponse(
            output_path,
            media_type="image/jpeg",
            filename=f"{original_name}_resized.jpg"
        )

    except Exception as e:

        cleanup_files(
            input_path,
            output_path
        )

        if isinstance(e, HTTPException):
            raise e

        raise HTTPException(
            status_code=500,
            detail=f"Resize failed: {str(e)}"
        )
