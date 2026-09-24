from pathlib import Path
import tempfile
import os
import shutil

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from markitdown import MarkItDown


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/convert")
async def convert_file(file: UploadFile = File(...)):

    # Get the original file extension
    original_name = file.filename or "uploaded_file"
    extension = Path(original_name).suffix.lower()

    # If there is no extension, stop here
    if not extension:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file has no file extension."
        )

    temp_path = None

    try:
        # Create a temporary file with the SAME extension
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=extension
        ) as temp:

            temp_path = temp.name

            # Copy uploaded file to temporary file
            shutil.copyfileobj(file.file, temp)

        print(
            f"Converting: {original_name} "
            f"({extension})"
        )

        # Create MarkItDown converter
        md = MarkItDown()

        # Convert the file
        result = md.convert(temp_path)

        print(
            f"Conversion successful: {original_name}"
        )

        return Response(
            content=result.markdown,
            media_type="text/markdown",
            headers={
                "Content-Disposition":
                    'attachment; filename="converted.md"'
            }
        )

    except Exception as error:

        print(
            f"CONVERSION ERROR: "
            f"{type(error).__name__}: {error}"
        )

        raise HTTPException(
            status_code=500,
            detail=f"Conversion failed: {str(error)}"
        )

    finally:

        # Delete temporary file
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

        await file.close()