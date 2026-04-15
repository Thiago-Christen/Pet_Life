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

            senha_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode("utf-8")

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

@app.post("/login_exe")
async def login_exe(
    request: Request,
    email: str = Form(...),
    senha: str = Form(...),
    db=Depends(get_db)
):
    try:
        with db.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM usuario WHERE email = %s", (email,))
            user = cursor.fetchone()

        if user and bcrypt.checkpw(senha.encode("utf-8"), user["senha"].encode("utf-8")):
            request.session["user"] = {
                "id": user["id"],
                "nome": user["nome"],
                "email": user["email"],
                "num_telefone": user["num_telefone"],
                "data_nascimento": str(user["data_nascimento"]),
                "cpf": user["cpf"]
            }
            return RedirectResponse(url="/index", status_code=303)

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
        return RedirectResponse(url="/login", status_code=303)

    finally:
        db.close()

@app.get("/index", response_class=HTMLResponse)
async def index_page(request: Request):
    user = request.session.get("user")
    if not user:
        return RedirectResponse(url="/login", status_code=303)

    flash = request.session.pop("flash", None)

    return templates.TemplateResponse("index.html", {
        "request": request,
        "user": user,
        "flash": flash
    })

@app.get("/dicas", response_class=HTMLResponse)
async def dicas_page(request: Request):
    user = request.session.get("user")
    if not user:
        return RedirectResponse(url="/login", status_code=303)

    flash = request.session.pop("flash", None)
    return templates.TemplateResponse("dicas.html", {
        "request": request,
        "user": user,
        "flash": flash
    })


@app.get("/profile", response_class=HTMLResponse)
async def profile_page(request: Request):
    user = request.session.get("user")
    if not user:
        return RedirectResponse(url="/login", status_code=303)

    flash = request.session.pop("flash", None)
    return templates.TemplateResponse("profile.html", {
        "request": request,
        "user": user,
        "flash": flash
    })

@app.post("/profile_update")
async def profile_update(
    request: Request,
    nome: str = Form(...),
    email: str = Form(...),
    num_telefone: str = Form(...),
    data_nascimento: str = Form(...),
    cpf: str = Form(...),
    senha: str = Form(None),
    db=Depends(get_db)
):
    user = request.session.get("user")
    if not user:
        return {"error": "Usuário não logado"}

    try:
        with db.cursor() as cursor:
            # Verificar se email já existe para outro usuário
            cursor.execute("SELECT id FROM usuario WHERE email = %s AND id != %s", (email, user["id"]))
            if cursor.fetchone():
                raise Exception("E-mail já cadastrado por outro usuário")

            # Verificar CPF
            cursor.execute("SELECT id FROM usuario WHERE cpf = %s AND id != %s", (cpf, user["id"]))
            if cursor.fetchone():
                raise Exception("CPF já cadastrado por outro usuário")

            # Atualizar dados
            if senha:
                senha_hash = bcrypt.hashpw(senha.encode(), bcrypt.gensalt()).decode("utf-8")
                sql = """
                    UPDATE usuario 
                    SET nome = %s, email = %s, num_telefone = %s, data_nascimento = %s, cpf = %s, senha = %s
                    WHERE id = %s
                """
                cursor.execute(sql, (nome, email, num_telefone, data_nascimento, cpf, senha_hash, user["id"]))
            else:
                sql = """
                    UPDATE usuario 
                    SET nome = %s, email = %s, num_telefone = %s, data_nascimento = %s, cpf = %s
                    WHERE id = %s
                """
                cursor.execute(sql, (nome, email, num_telefone, data_nascimento, cpf, user["id"]))

        db.commit()

        # Atualizar sessão
        request.session["user"] = {
            "id": user["id"],
            "nome": nome,
            "email": email,
            "num_telefone": num_telefone,
            "data_nascimento": data_nascimento,
            "cpf": cpf
        }

        return {"success": "Perfil atualizado com sucesso"}

    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()

@app.delete("/profile_delete")
async def profile_delete(request: Request, db=Depends(get_db)):
    user = request.session.get("user")
    if not user:
        return {"error": "Usuário não logado"}

    try:
        with db.cursor() as cursor:
            cursor.execute("DELETE FROM usuario WHERE id = %s", (user["id"],))

        db.commit()

        # Limpar sessão
        request.session.clear()

        return {"success": "Conta deletada com sucesso"}

    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()