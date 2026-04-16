import pymysql

# Função para obter conexão com MySQL
def get_db():
    return pymysql.connect(host="localhost",
        user="root",
        password="root@",
        database="petlife",
        cursorclass=pymysql.cursors.DictCursor)