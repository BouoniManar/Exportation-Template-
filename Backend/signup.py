from fastapi import FastAPI
from Backend.users import router  

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "API is running!"}

app.include_router(router)
