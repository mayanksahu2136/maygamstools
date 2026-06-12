from fastapi import (
    APIRouter,
    UploadFile,
    File,
    BackgroundTasks,
    HTTPException
)

from fastapi.responses import FileResponse

from rembg import remove


import os
import uuid

router = APIRouter()

UPLOAD_DIR = "uploads"
CONVERTED_DIR = "converted"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)

os.makedirs(
    CONVERTED_DIR,
    exist_ok=True
)

MAX_FILE_SIZE = 20 * 1024 * 1024


def cleanup_files(*paths):
    for path in paths:
        try:
            if path and os.path.exists(path):
                os.remove(path)
        except Exception:
            pass


@router.post("/remove-background")
async def remove_background(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):

    extension = os.path.splitext(
        file.filename
    )[1].lower()

    if extension not in [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    ]:
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

    unique_name = str(
        uuid.uuid4()
    )

    input_path = os.path.join(
        UPLOAD_DIR,
        f"{unique_name}{extension}"
    )

    output_path = os.path.join(
        CONVERTED_DIR,
        f"{unique_name}.png"
    )

    try:

        with open(
            input_path,
            "wb"
        ) as f:
            f.write(content)

        with open(
            input_path,
            "rb"
        ) as input_file:

            input_data = input_file.read()

        output_data = remove(
            input_data
        )

        with open(
            output_path,
            "wb"
        ) as output_file:

            output_file.write(
                output_data
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
            path=output_path,
            media_type="image/png",
            filename=f"{original_name}_bg_removed.png"
        )

    except Exception as e:

        cleanup_files(
            input_path,
            output_path
        )

        raise HTTPException(
            status_code=500,
            detail=f"Background removal failed: {str(e)}"
        )