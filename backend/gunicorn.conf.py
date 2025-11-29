from app.config import settings

bind = f"0.0.0.0:{settings.PORT}"
workers = 4
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 50
timeout = 30
keepalive = 2
loglevel = "info"
accesslog = "-"
errorlog = "-"
