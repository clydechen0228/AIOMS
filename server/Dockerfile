FROM python:3.9-slim

WORKDIR /app

# Install system dependencies if needed (e.g. for sqlite)
# RUN apt-get update && apt-get install -y sqlite3

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 3001

CMD ["python", "main.py"]
