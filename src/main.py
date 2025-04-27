from fastapi import FastAPI,HTTPException,Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

@app.get("/")
async def name(request:Request):
    return templates.TemplateResponse("index.html",{"request":request,"name":"4205a2"})