FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN python -c "from skyfield.api import load; load('de421.bsp')"

# Download HYG database (too large for HF Spaces git)
RUN mkdir -p data && curl -sL -o data/hyg_database.csv \
  "https://raw.githubusercontent.com/HassanNawaz14/Stellar-DNA/main/backend/data/hyg_database.csv"

COPY . .

EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]