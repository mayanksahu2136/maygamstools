FROM python:3.11

RUN useradd -m -u 1000 user

USER user

ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

COPY --chown=user . /app

RUN pip install --no-cache-dir -r backend/requirements.txt

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]