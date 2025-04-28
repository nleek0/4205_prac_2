from fastapi import FastAPI,HTTPException,Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from src.database import Database

database = Database()

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

@app.get("/")
async def name(request:Request):
    return templates.TemplateResponse("index.html",{"request":request,"name":"4205a2"})

@app.get("/get_checkins")
async def get_checkins(request:Request):
    user_id = request.query_params.get('myTextbox')
    if not (user_id and user_id.isdigit()):
        return

    rows = database.get_checkins(user_id)
    columns = ["user_id", "latitude","longitude"]
    checkins = [dict(zip(columns,row)) for row in rows]
    return JSONResponse(content=checkins)
