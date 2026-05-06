import pymysql
import bcrypt
import os
import shutil
import time
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
    max_age=50000,
    same_site="lax",
    https_only=False
)

SESSION_TIMEOUT = 600

def verificar_sessao(request: Request):
    user = request.session.get("user")
    last_activity = request.session.get("last_activity")

    if not user or not last_activity:
        return None

    if time.time() - last_activity > SESSION_TIMEOUT:
        request.session.clear()
        return None

    request.session["last_activity"] = time.time()
    return user

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

@app.get("/logout")
def logout(request: Request):
    request.session.clear()
    return RedirectResponse("/login", status_code=302)


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

            cursor.execute("SELECT * FROM usuario WHERE email = %s", (email,))
            if cursor.fetchone():
                raise Exception("E-mail já cadastrado")

            cursor.execute("SELECT * FROM usuario WHERE cpf = %s", (cpf,))
            if cursor.fetchone():
                raise Exception("CPF já cadastrado")

            senha_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode("utf-8")

            sql = """
                INSERT INTO usuario 
                (nome, senha, email, num_telefone, data_nascimento, cpf)
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
            request.session["last_activity"] = time.time()  
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
async def index_page(request: Request, db=Depends(get_db)):
    user = verificar_sessao(request)
    if not user:
        return RedirectResponse(url="/login", status_code=303)

    flash = request.session.pop("flash", None)
    
    # Buscar os pets do usuário logado
    pets = []
    try:
        with db.cursor(pymysql.cursors.DictCursor) as cursor:
            # Calcula a idade automaticamente
            sql = """
                SELECT 
                    p.pet_id,
                    p.nome,
                    p.especie,
                    p.genero,
                    p.raca,
                    p.data_nascimento,
                    p.peso,
                    p.porte,
                    p.foto,
                    TIMESTAMPDIFF(YEAR, p.data_nascimento, CURDATE()) AS idade
                FROM pet p
                WHERE p.fk_usuario_id = %s
                ORDER BY p.pet_id DESC
            """
            cursor.execute(sql, (user["id"],))
            pets = cursor.fetchall()
    except Exception as e:
        print(f"Erro ao buscar pets: {e}")
    
    return templates.TemplateResponse("index.html", {
        "request": request,
        "user": user,
        "flash": flash,
        "pets": pets  # ← adicionar os pets
    })


@app.get("/dicas", response_class=HTMLResponse)
async def dicas_page(request: Request):
    user = verificar_sessao(request)
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
    user = verificar_sessao(request)
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
    user = verificar_sessao(request)
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
    user = verificar_sessao(request)
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


# ==================== ROTAS PARA CADASTRO DE PET ====================

@app.get("/pet_register", response_class=HTMLResponse)
async def pet_register_page(request: Request):
    user = verificar_sessao(request)
    if not user:
        return RedirectResponse(url="/login", status_code=303)
    
    flash = request.session.pop("flash", None)
    return templates.TemplateResponse("pet_register.html", {
        "request": request,
        "user": user,
        "flash": flash
    })


@app.post("/pet_register_exe")
async def pet_register_exe(
    request: Request,
    nome: str = Form(...),
    genero: str = Form(...),
    especie: str = Form(...),
    raca: str = Form(None),
    data_nascimento: str = Form(...),
    peso: float = Form(None),
    porte: str = Form(...),
    foto: UploadFile = File(None),
    db=Depends(get_db)
):
    user = verificar_sessao(request)
    if not user:
        return {"error": "Usuário não logado"}
    
    try:
        # Validar dados
        if len(nome) < 2 or len(nome) > 100:
            raise Exception("Nome deve ter entre 2 e 100 caracteres")
        
        if especie not in ["gato", "cachorro"]:
            raise Exception("Espécie inválida")
        
        if genero not in ["macho", "femea"]:
            raise Exception("Gênero inválido")
        
        if porte not in ["pequeno", "medio", "grande"]:
            raise Exception("Porte inválido")
        
        # Validar raça (opcional)
        if raca and len(raca) > 50:
            raise Exception("Raça muito longa (máx 50 caracteres)")
        
        # Validar data de nascimento
        try:
            data_nasc = datetime.strptime(data_nascimento, "%Y-%m-%d").date()
            if data_nasc > date.today():
                raise Exception("Data de nascimento não pode ser futura")
        except ValueError:
            raise Exception("Data de nascimento inválida")
        
        # Validar peso
        if peso is not None and peso < 0:
            raise Exception("Peso não pode ser negativo")
        
        if peso is not None and peso > 200:
            raise Exception("Peso não pode ser maior que 200kg")
        
        # Processar foto se fornecida
        foto_path = None
        if foto and foto.filename:
            # Criar diretório se não existir
            upload_dir = "frontend/static/uploads/pets"
            os.makedirs(upload_dir, exist_ok=True)
            
            # Validar tipo de arquivo
            allowed_extensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
            ext = os.path.splitext(foto.filename)[1].lower()
            
            if ext not in allowed_extensions:
                raise Exception("Formato de imagem não suportado. Use JPG, PNG, GIF ou WEBP")
            
            # Validar tamanho (max 5MB)
            foto.file.seek(0, os.SEEK_END)
            file_size = foto.file.tell()
            foto.file.seek(0)
            
            if file_size > 5 * 1024 * 1024:
                raise Exception("A imagem deve ter no máximo 5MB")
            
            # Gerar nome único para o arquivo
            filename = f"pet_{user['id']}_{datetime.now().strftime('%Y%m%d%H%M%S')}{ext}"
            filepath = os.path.join(upload_dir, filename)
            
            # Salvar arquivo
            with open(filepath, "wb") as buffer:
                shutil.copyfileobj(foto.file, buffer)
            
            foto_path = f"/static/uploads/pets/{filename}"
        
        # Inserir no banco
        with db.cursor() as cursor:
            sql = """
                INSERT INTO pet (nome, genero, especie, raca, data_nascimento, peso, porte, foto, fk_usuario_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (
                nome, 
                genero, 
                especie, 
                raca if raca else None, 
                data_nascimento, 
                peso, 
                porte, 
                foto_path, 
                user["id"]
            ))
        
        db.commit()
        
        return {"success": True, "message": f"{nome} foi cadastrado com sucesso!"}
        
    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()
