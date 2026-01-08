from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from pymysql.constants import CLIENT
import os 

load_dotenv()


# Build DB URL from environment variables
db_url = f'mysql+pymysql://{os.getenv("dbuser")}:{os.getenv("dbpassword")}@{os.getenv("dbhost")}:{os.getenv("dbport")}/{os.getenv("dbname")}'

# Create engine with support for multiple statements
engine = create_engine(db_url, connect_args={"client_flag": CLIENT.MULTI_STATEMENTS})


# Create session
Session = sessionmaker(bind=engine)
db = Session()


# Define all create table queries
create_table_query = text("""
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(100) NOT NULL,
    userType VARCHAR(50) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

 
CREATE TABLE IF NOT EXISTS chat_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);


CREATE TABLE IF NOT EXISTS messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT,
    role VARCHAR(20) CHECK (role IN ('user', 'assistant')),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id)
);


CREATE TABLE IF NOT EXISTS citations (
    citation_id INT AUTO_INCREMENT PRIMARY KEY,
    message_id INT,
    source_path TEXT,
    page_number INT,
    document_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(message_id)
);

 
CREATE TABLE IF NOT EXISTS query_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    question TEXT,
    retrieved_docs INT,
    response_time_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
""")

db.execute(create_table_query)
db.commit()

print("All Tax RAG tables created successfully.")

# To run the app, use the command:
# python tax_database.py