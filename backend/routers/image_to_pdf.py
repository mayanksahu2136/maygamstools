from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
from PIL import Image
from typing import List
import traceback
import os
import uuid

router = APIRouter()

UPLOAD_DIR = "uploads"
CONVERTED_DIR = "converted"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(CONVERTED_DIR, exist_ok=True)

MAX_FILES = 50
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB


def cleanup_files(*paths):
    for path in paths:
        try:
            if path and os.path.exists(path):
                os.remove(path)
        except Exception:
            pass


@router.post("/img-to-pdf")
async def img_to_pdf(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...)
):

    if not files:
        raise HTTPException(
            status_code=400,
            detail="No images uploaded"
        )

    if len(files) > MAX_FILES:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {MAX_FILES} images allowed"
        )

    unique_name = str(uuid.uuid4())

    original_name = os.path.splitext(
        files[0].filename
    )[0]

    pdf_path = os.path.join(
        CONVERTED_DIR,
        f"{unique_name}.pdf"
    )

    temp_files = []
    images = []

    try:

        for uploaded_file in files:

            content = await uploaded_file.read()

            if len(content) > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"{uploaded_file.filename} exceeds 20MB limit"
                )

            extension = os.path.splitext(
                uploaded_file.filename
            )[1].lower()

            if extension not in [".jpg", ".jpeg", ".png", ".webp"]:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported file type: {uploaded_file.filename}"
                )

            image_path = os.path.join(
                UPLOAD_DIR,
                f"{uuid.uuid4()}{extension}"
            )

            with open(image_path, "wb") as f:
                f.write(content)

            temp_files.append(image_path)

            img = Image.open(image_path)

            # Force RGB
            if img.mode != "RGB":
                img = img.convert("RGB")

            images.append(img)

        if len(images) == 0:
            raise HTTPException(
                status_code=400,
                detail="No valid images found"
            )

        first_image = images[0]
        remaining_images = images[1:]

        # Create PDF
        first_image.save(
            pdf_path,
            "PDF",
            resolution=100.0,
            save_all=True,
            append_images=remaining_images
        )

        background_tasks.add_task(
            cleanup_files,
            pdf_path,
            *temp_files
        )

        return FileResponse(
            path=pdf_path,
            media_type="application/pdf",
            filename=f"{original_name}.pdf"
        )

    except HTTPException:
        cleanup_files(*temp_files, pdf_path)
        raise

    except Exception as e:
        traceback.print_exc()

        cleanup_files(*temp_files, pdf_path)

        raise HTTPException(
            status_code=500,
            detail=f"Conversion failed: {str(e)}"
        )