import pymysql

import bcrypt

from mangum import Mangum
from fastapi import FastAPI, Request, Form, Depends, UploadFile, File
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware
from datetime import date, datetime
from backend.db import get_db


app = FastAPI()

# Configuração de sessão
app.add_middleware(
    SessionMiddleware,
    secret_key="Pet_life",
    session_cookie="petlife_session",
    max_age = 50000,  # (50 = 5 segundos)
    same_site="lax",
    https_only=False
)

# Configuração de arquivos estáticos
app.mount("/static", StaticFiles(directory="frontend/static"), name="static")

# Configuração de templates Jinja2
templates = Jinja2Templates(directory="frontend/pages")

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
        return RedirectResponse(url="/register", status_code=303)

@app.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    flash = request.session.pop("flash", None)
    return templates.TemplateResponse("register.html", {
        "request": request,
        "flash": flash
    })

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    flash = request.session.pop("flash", None)
    return templates.TemplateResponse("login.html", {
        "request": request,
        "flash": flash
    })

@app.post("/register_exe")
async def register_exe(
    request: Request,
    nome: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    birthdate: str = Form(...),
    cpfCnpj: str = Form(...),
    password: str = Form(...),
    confirmPassword: str = Form(...),
    db=Depends(get_db)
):
    print("DEBUG", "chamou!!!!!!!!!!!!")
    try:
        if password != confirmPassword:
            raise Exception("As senhas não coincidem")

        if len(password) < 6:
            raise Exception("Senha muito curta")

        cpf = cpfCnpj.replace(".", "").replace("-", "")
        celular = ''.join(filter(str.isdigit, phone))

        data = datetime.strptime(birthdate, "%Y-%m-%d")
        idade = (datetime.now() - data).days // 365

        if idade < 18:
            raise Exception("Você precisa ter 18 anos")

        with db.cursor() as cursor:
            print("CONECTOU NO BANCO")

            cursor.execute("SELECT * FROM usuario WHERE email =%s", (email,))
            if cursor.fetchone():
                raise Exception("E-mail já cadastrado")

            cursor.execute("SELECT * FROM usuario WHERE cpf = %s", (cpf,))
            if cursor.fetchone():
                raise Exception("CPF já cadastrado")

            senha_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

            sql = """
                    INSERT INTO usuario 
                    (nome,senha ,email, num_telefone, data_nascimento, cpf)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """

            cursor.execute(sql, (
                    nome,
                    senha_hash,
                    email,
                    celular,
                    birthdate,
                    cpf
            ))

        db.commit()

        request.session["flash"] = {
            "tipo": "sucesso",
            "header": "Sucesso",
            "texto": "Conta criada com sucesso!"
        }

        
        return RedirectResponse(url="/login", status_code=303)
    
    except Exception as e:
        request.session["flash"] = {
            "tipo": "erro",
            "header": "Erro no cadastro",
            "texto": str(e)
        }

        return RedirectResponse(url="/register", status_code=303)
    
    finally:
        db.close()


@app.get("/index", response_class=HTMLResponse)
async def index_page(request: Request):
    flash = request.session.pop("flash", None)

    return templates.TemplateResponse("index.html", {
        "request": request,
        "flash": flash
    })

@app.post("/login_exe")
async def login_exe(
    request: Request,
    email: str = Form(...),
    senha: str = Form(...),
    db=Depends(get_db)
):
    try:
        with db.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = "SELECT * FROM usuario WHERE email=%s"
            cursor.execute(sql, (email,))
            user = cursor.fetchone()

        if user and bcrypt.checkpw(senha.encode(), user["senha"]):
                
                request.session["flash"] = {
                    "tipo": "sucesso",
                    "header": "Login realizado",
                    "texto": f"Bem-vindo, {user['nome']}!"
                }

                return RedirectResponse(url="/index", status_code=303)

        else:
                request.session["flash"] = {
                    "tipo": "erro",
                    "header": "Erro no login",
                    "texto": "Email ou senha inválidos"
                }

                return RedirectResponse(url="/login", status_code=303)

    except Exception as e:
        request.session["flash"] = {
            "tipo": "erro",
            "header": "Erro no login",
            "texto": str(e)
        }
        
    db.close()