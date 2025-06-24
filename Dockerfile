FROM python:3.11-slim-bookworm

RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y ffmpeg poppler-utils redis-tools \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY backend/ .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
